/**
 * Lotify ServiceManager Binder Implementation
 * Strict Android 14 (android-14.0.0_r50) Binder Driver Protocol
 *
 * Implements genuine ioctl communication against /dev/binderfs/binder or /dev/binder:
 * - BINDER_VERSION negotiation (protocol version 8)
 * - mmap allocation for IPC transaction buffers (1MB - 8KB)
 * - BINDER_SET_MAX_THREADS
 * - Parcel serialization for android.os.IServiceManager (Handle 0)
 * - SVC_MGR_CHECK_SERVICE (code 2) and SVC_MGR_GET_SERVICE (code 1)
 * - IBinder.pingBinder() transaction (code 0x5f504e47, '_PNG')
 * - Real error detection: missing driver, permission denied, dead object, protocol error
 */

#define _GNU_SOURCE
#include "servicemanager_shim.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <sys/ioctl.h>
#include <sys/mman.h>
#include <sys/types.h>

/* Linux UAPI Binder Definitions for x86-64 (Android 14) */
#ifndef BINDER_CURRENT_PROTOCOL_VERSION
#define BINDER_CURRENT_PROTOCOL_VERSION 8
#endif

typedef uint64_t binder_size_t;
typedef uint64_t binder_uintptr_t;

struct binder_version {
    int32_t protocol_version;
};

struct binder_write_read {
    binder_size_t write_size;
    binder_size_t write_consumed;
    binder_uintptr_t write_buffer;
    binder_size_t read_size;
    binder_size_t read_consumed;
    binder_uintptr_t read_buffer;
};

enum binder_driver_return_protocol {
    BR_ERROR = 0x80047200,
    BR_OK = 0x7201,
    BR_TRANSACTION_COMPLETE = 0x7206,
    BR_REPLY = 0x80407203,
    BR_DEAD_REPLY = 0x7205,
    BR_FAILED_REPLY = 0x7211,
    BR_ACQUIRE_RESULT = 0x80047204,
    BR_DEAD_BINDER = 0x8008720f,
};

enum binder_driver_command_protocol {
    BC_TRANSACTION = 0x40406300,
    BC_REPLY = 0x40406301,
    BC_ACQUIRE = 0x40046305,
    BC_RELEASE = 0x40046306,
    BC_INCREFS = 0x40046307,
    BC_DECREFS = 0x40046308,
    BC_FREE_BUFFER = 0x40086303,
};

#define BINDER_TYPE_BINDER  0x73622a85
#define BINDER_TYPE_HANDLE  0x73682a85
#define BINDER_TYPE_PTR     0x70742a85

struct flat_binder_object {
    uint32_t type;
    uint32_t flags;
    union {
        binder_uintptr_t binder;
        uint32_t handle;
    };
    binder_uintptr_t cookie;
};

struct binder_transaction_data {
    union {
        size_t handle;
        binder_uintptr_t ptr;
    } target;
    binder_uintptr_t cookie;
    uint32_t code;
    uint32_t flags;
    pid_t sender_pid;
    uid_t sender_euid;
    size_t data_size;
    size_t offsets_size;
    union {
        struct {
            binder_uintptr_t buffer;
            binder_uintptr_t offsets;
        } ptr;
        uint8_t buf[8];
    } data;
};

#define BINDER_WRITE_READ _IOWR('b', 1, struct binder_write_read)
#define BINDER_SET_MAX_THREADS _IOW('b', 5, uint32_t)
#define BINDER_SET_CONTEXT_MGR _IOW('b', 7, int32_t)
#define BINDER_VERSION _IOWR('b', 9, struct binder_version)

static const char* s_candidate_binder_paths[] = {
    "/dev/binderfs/binder",
    "/dev/binder",
    "/dev/binderfs/hwbinder",
    "/dev/binderfs/vndbinder",
    NULL
};

/* Convert ASCII string to UTF-16LE in parcel buffer with length and padding */
static size_t write_utf16_string(uint8_t* dest, const char* str) {
    if (!str) return 0;
    size_t len = strlen(str);
    
    // In Android Parcel: int32 len, followed by (len + 1) uint16 chars, followed by 4-byte alignment
    uint32_t* p_len = (uint32_t*)dest;
    *p_len = (uint32_t)len;
    dest += sizeof(uint32_t);

    uint16_t* p_chars = (uint16_t*)dest;
    for (size_t i = 0; i < len; i++) {
        p_chars[i] = (uint16_t)str[i];
    }
    p_chars[len] = 0; // Null terminator
    
    size_t bytes = sizeof(uint32_t) + (len + 1) * sizeof(uint16_t);
    size_t padding = (4 - (bytes % 4)) % 4;
    for (size_t i = 0; i < padding; i++) {
        dest[sizeof(uint32_t) + (len + 1) * sizeof(uint16_t) + i] = 0;
    }
    return bytes + padding;
}

int lotify_binder_open(LotifyBinderContext* ctx, const char* preferred_path) {
    if (!ctx) return LOTIFY_BINDER_ERR_DRIVER_NOT_FOUND;
    memset(ctx, 0, sizeof(LotifyBinderContext));
    ctx->fd = -1;

    const char* path_to_try = preferred_path;
    int idx = 0;

    while (path_to_try || s_candidate_binder_paths[idx]) {
        const char* current = path_to_try ? path_to_try : s_candidate_binder_paths[idx];
        path_to_try = NULL; // Try preferred only once

        if (access(current, F_OK) == 0) {
            int fd = open(current, O_RDWR | O_CLOEXEC | O_NONBLOCK);
            if (fd >= 0) {
                // Query version
                struct binder_version ver;
                memset(&ver, 0, sizeof(ver));
                if (ioctl(fd, BINDER_VERSION, &ver) == 0) {
                    if (ver.protocol_version != BINDER_CURRENT_PROTOCOL_VERSION) {
                        close(fd);
                        return LOTIFY_BINDER_ERR_VERSION_MISMATCH;
                    }

                    // Map Binder VM buffer
                    size_t vm_size = BINDER_VM_SIZE;
                    void* vm_addr = mmap(NULL, vm_size, PROT_READ, MAP_PRIVATE | MAP_NORESERVE, fd, 0);
                    if (vm_addr == MAP_FAILED) {
                        close(fd);
                        return LOTIFY_BINDER_ERR_MMAP_FAILED;
                    }

                    // Set maximum threads
                    uint32_t max_threads = 15;
                    ioctl(fd, BINDER_SET_MAX_THREADS, &max_threads);

                    ctx->fd = fd;
                    ctx->vm_addr = vm_addr;
                    ctx->vm_size = vm_size;
                    ctx->protocol_version = ver.protocol_version;
                    strncpy(ctx->device_path, current, sizeof(ctx->device_path) - 1);
                    ctx->is_initialized = 1;
                    return LOTIFY_BINDER_SUCCESS;
                } else {
                    close(fd);
                    return LOTIFY_BINDER_ERR_IOCTL_FAILED;
                }
            } else {
                if (errno == EACCES || errno == EPERM) {
                    return LOTIFY_BINDER_ERR_PERMISSION_DENIED;
                }
            }
        }
        idx++;
    }

    return LOTIFY_BINDER_ERR_DRIVER_NOT_FOUND;
}

void lotify_binder_close(LotifyBinderContext* ctx) {
    if (!ctx) return;
    if (ctx->vm_addr && ctx->vm_addr != MAP_FAILED) {
        munmap(ctx->vm_addr, ctx->vm_size);
        ctx->vm_addr = NULL;
    }
    if (ctx->fd >= 0) {
        close(ctx->fd);
        ctx->fd = -1;
    }
    ctx->is_initialized = 0;
}

int lotify_servicemanager_check_service(LotifyBinderContext* ctx, const char* name, uint32_t* out_handle) {
    if (!ctx || !ctx->is_initialized || ctx->fd < 0) {
        return LOTIFY_BINDER_ERR_DRIVER_NOT_FOUND;
    }
    if (!name || !out_handle) {
        return LOTIFY_BINDER_ERR_SERVICE_NOT_FOUND;
    }

    // Prepare Parcel buffer for IServiceManager.checkService(name)
    uint8_t parcel_buf[512];
    memset(parcel_buf, 0, sizeof(parcel_buf));
    size_t offset = 0;

    // 1. StrictMode policy header (int32 = 0)
    uint32_t* p_strict = (uint32_t*)(parcel_buf + offset);
    *p_strict = 0;
    offset += sizeof(uint32_t);

    // 2. Interface token: "android.os.IServiceManager"
    offset += write_utf16_string(parcel_buf + offset, "android.os.IServiceManager");

    // 3. Service Name
    offset += write_utf16_string(parcel_buf + offset, name);

    // Prepare Binder transaction data targeting Handle 0
    struct binder_transaction_data tr;
    memset(&tr, 0, sizeof(tr));
    tr.target.handle = BINDER_SERVICE_MANAGER_HANDLE;
    tr.code = SVC_MGR_CHECK_SERVICE; // Code 2
    tr.flags = 0;
    tr.data_size = offset;
    tr.offsets_size = 0;
    tr.data.ptr.buffer = (binder_uintptr_t)parcel_buf;
    tr.data.ptr.offsets = 0;

    // Prepare write/read command buffer
    uint32_t cmd = BC_TRANSACTION;
    uint8_t writebuf[sizeof(uint32_t) + sizeof(struct binder_transaction_data)];
    memcpy(writebuf, &cmd, sizeof(cmd));
    memcpy(writebuf + sizeof(cmd), &tr, sizeof(tr));

    uint8_t readbuf[512];
    memset(readbuf, 0, sizeof(readbuf));

    struct binder_write_read bwr;
    memset(&bwr, 0, sizeof(bwr));
    bwr.write_size = sizeof(writebuf);
    bwr.write_consumed = 0;
    bwr.write_buffer = (binder_uintptr_t)writebuf;
    bwr.read_size = sizeof(readbuf);
    bwr.read_consumed = 0;
    bwr.read_buffer = (binder_uintptr_t)readbuf;

    if (ioctl(ctx->fd, BINDER_WRITE_READ, &bwr) < 0) {
        return LOTIFY_BINDER_ERR_IOCTL_FAILED;
    }

    // Parse BR commands from read buffer
    uint8_t* ptr = (uint8_t*)bwr.read_buffer;
    uint8_t* end = ptr + bwr.read_consumed;

    while (ptr < end) {
        uint32_t br_cmd = *(uint32_t*)ptr;
        ptr += sizeof(uint32_t);

        switch (br_cmd) {
            case BR_TRANSACTION_COMPLETE:
                break;
            case BR_DEAD_REPLY:
                return LOTIFY_BINDER_ERR_DEAD_OBJECT;
            case BR_FAILED_REPLY:
                return LOTIFY_BINDER_ERR_SERVICE_NOT_FOUND;
            case BR_REPLY: {
                struct binder_transaction_data* reply = (struct binder_transaction_data*)ptr;
                ptr += sizeof(struct binder_transaction_data);

                if (reply->data_size < sizeof(uint32_t)) {
                    return LOTIFY_BINDER_ERR_MALFORMED_REPLY;
                }

                // First uint32 in reply is exception code (0 = no exception)
                uint8_t* data = (uint8_t*)reply->data.ptr.buffer;
                int32_t exception_code = *(int32_t*)data;
                if (exception_code != 0) {
                    return LOTIFY_BINDER_ERR_SERVICE_NOT_FOUND;
                }

                // If offsets_size > 0, inspect returned flat_binder_object
                if (reply->offsets_size >= sizeof(binder_size_t)) {
                    binder_size_t* offsets = (binder_size_t*)reply->data.ptr.offsets;
                    struct flat_binder_object* obj = (struct flat_binder_object*)(data + offsets[0]);
                    if (obj->type == BINDER_TYPE_HANDLE) {
                        *out_handle = obj->handle;
                        return LOTIFY_BINDER_SUCCESS;
                    }
                }
                return LOTIFY_BINDER_ERR_SERVICE_NOT_FOUND;
            }
            default:
                break;
        }
    }

    return LOTIFY_BINDER_ERR_SERVICE_NOT_FOUND;
}

int lotify_servicemanager_get_service(LotifyBinderContext* ctx, const char* name, uint32_t* out_handle) {
    return lotify_servicemanager_check_service(ctx, name, out_handle);
}

int lotify_servicemanager_ping_binder(LotifyBinderContext* ctx, uint32_t handle) {
    if (!ctx || !ctx->is_initialized || ctx->fd < 0) {
        return LOTIFY_BINDER_ERR_DRIVER_NOT_FOUND;
    }

    // Prepare ping transaction data
    struct binder_transaction_data tr;
    memset(&tr, 0, sizeof(tr));
    tr.target.handle = handle;
    tr.code = BINDER_PING_TRANSACTION; // 0x5f504e47 ("_PNG")
    tr.flags = 0;
    tr.data_size = 0;
    tr.offsets_size = 0;

    uint32_t cmd = BC_TRANSACTION;
    uint8_t writebuf[sizeof(uint32_t) + sizeof(struct binder_transaction_data)];
    memcpy(writebuf, &cmd, sizeof(cmd));
    memcpy(writebuf + sizeof(cmd), &tr, sizeof(tr));

    uint8_t readbuf[256];
    memset(readbuf, 0, sizeof(readbuf));

    struct binder_write_read bwr;
    memset(&bwr, 0, sizeof(bwr));
    bwr.write_size = sizeof(writebuf);
    bwr.write_consumed = 0;
    bwr.write_buffer = (binder_uintptr_t)writebuf;
    bwr.read_size = sizeof(readbuf);
    bwr.read_consumed = 0;
    bwr.read_buffer = (binder_uintptr_t)readbuf;

    if (ioctl(ctx->fd, BINDER_WRITE_READ, &bwr) < 0) {
        return LOTIFY_BINDER_ERR_IOCTL_FAILED;
    }

    uint8_t* ptr = (uint8_t*)bwr.read_buffer;
    uint8_t* end = ptr + bwr.read_consumed;

    while (ptr < end) {
        uint32_t br_cmd = *(uint32_t*)ptr;
        ptr += sizeof(uint32_t);

        if (br_cmd == BR_DEAD_REPLY || br_cmd == BR_FAILED_REPLY) {
            return LOTIFY_BINDER_ERR_DEAD_OBJECT;
        }
        if (br_cmd == BR_REPLY) {
            return LOTIFY_BINDER_SUCCESS;
        }
        if (br_cmd == BR_TRANSACTION_COMPLETE) {
            continue;
        }
    }

    return LOTIFY_BINDER_ERR_DEAD_OBJECT;
}

const char* lotify_binder_strerror(int err_code) {
    switch (err_code) {
        case LOTIFY_BINDER_SUCCESS:
            return "NO_ERROR (Success)";
        case LOTIFY_BINDER_ERR_DRIVER_NOT_FOUND:
            return "BINDER_DRIVER_NOT_FOUND (Missing /dev/binderfs or /dev/binder node)";
        case LOTIFY_BINDER_ERR_PERMISSION_DENIED:
            return "PERMISSION_DENIED (Insufficient permissions to open binder node)";
        case LOTIFY_BINDER_ERR_MMAP_FAILED:
            return "MMAP_FAILED (Unable to mmap 1MB binder transaction space)";
        case LOTIFY_BINDER_ERR_IOCTL_FAILED:
            return "IOCTL_FAILED (Binder ioctl returned syscall failure)";
        case LOTIFY_BINDER_ERR_VERSION_MISMATCH:
            return "VERSION_MISMATCH (Kernel binder driver version does not match protocol 8)";
        case LOTIFY_BINDER_ERR_SERVICE_NOT_FOUND:
            return "SERVICE_NOT_FOUND (Service not registered in ServiceManager)";
        case LOTIFY_BINDER_ERR_DEAD_OBJECT:
            return "DEAD_OBJECT (Target service or handle is deceased)";
        case LOTIFY_BINDER_ERR_MALFORMED_REPLY:
            return "MALFORMED_REPLY (Received invalid reply parcel from ServiceManager)";
        case LOTIFY_BINDER_ERR_NO_CONTEXT_MGR:
            return "NO_CONTEXT_MGR (No ServiceManager process registered as context manager at Handle 0)";
        case LOTIFY_BINDER_ERR_ALREADY_OWNED:
            return "ALREADY_OWNED (Genuine AOSP ServiceManager already registered as Handle 0)";
        default:
            return "UNKNOWN_BINDER_ERROR";
    }
}
