/**
 * Lotify ServiceManager Binder Protocol Definitions
 * Strict Android 14 (AOSP android-14.0.0_r50) Binder Driver ABI
 * Reference: AOSP bionic/libc/kernel/uapi/linux/android/binder.h
 *            frameworks/native/libs/binder/include/binder/IServiceManager.h
 */

#ifndef LOTIFY_SERVICEMANAGER_SHIM_H
#define LOTIFY_SERVICEMANAGER_SHIM_H

#include <stdint.h>
#include <stddef.h>
#include <sys/types.h>

#ifdef __cplusplus
extern "C" {
#endif

#define BINDER_SERVICE_MANAGER_HANDLE 0
#define BINDER_PING_TRANSACTION 0x5f504e47 /* "_PNG" */
#define BINDER_CURRENT_PROTOCOL_VERSION 8
#define BINDER_VM_SIZE ((1024 * 1024) - (4096 * 2)) /* 1MB - 8KB */

/* AOSP IServiceManager AIDL Transaction Codes (android.os.IServiceManager) */
enum {
    SVC_MGR_GET_SERVICE = 1,
    SVC_MGR_CHECK_SERVICE = 2,
    SVC_MGR_ADD_SERVICE = 3,
    SVC_MGR_LIST_SERVICES = 4,
    SVC_MGR_REGISTER_FOR_NOTIFICATIONS = 5,
    SVC_MGR_IS_DECLARED = 6,
};

/* Lotify Binder Error Codes */
enum {
    LOTIFY_BINDER_SUCCESS = 0,
    LOTIFY_BINDER_ERR_DRIVER_NOT_FOUND = -1,
    LOTIFY_BINDER_ERR_PERMISSION_DENIED = -2,
    LOTIFY_BINDER_ERR_MMAP_FAILED = -3,
    LOTIFY_BINDER_ERR_IOCTL_FAILED = -4,
    LOTIFY_BINDER_ERR_VERSION_MISMATCH = -5,
    LOTIFY_BINDER_ERR_SERVICE_NOT_FOUND = -6,
    LOTIFY_BINDER_ERR_DEAD_OBJECT = -7,
    LOTIFY_BINDER_ERR_MALFORMED_REPLY = -8,
    LOTIFY_BINDER_ERR_NO_CONTEXT_MGR = -9,
    LOTIFY_BINDER_ERR_ALREADY_OWNED = -10,
};

/* Service Resolution Status */
typedef enum {
    SERVICE_STATUS_CONFIGURED = 0,
    SERVICE_STATUS_DISCOVERED = 1,
    SERVICE_STATUS_PING_VERIFIED = 2,
    SERVICE_STATUS_NOT_FOUND = 3,
    SERVICE_STATUS_BLOCKED = 4,
} LotifyServiceStatus;

typedef struct {
    uint32_t handle;
    char name[64];
    char interface_descriptor[128];
    LotifyServiceStatus status;
    int is_critical;
} LotifyServiceRecord;

/**
 * Genuine Binder connection context.
 * Owns the file descriptor and mmap buffer for /dev/binderfs/binder.
 */
typedef struct {
    int fd;
    void* vm_addr;
    size_t vm_size;
    int protocol_version;
    char device_path[256];
    int is_initialized;
} LotifyBinderContext;

/* Core transport lifecycle */
int lotify_binder_open(LotifyBinderContext* ctx, const char* preferred_path);
void lotify_binder_close(LotifyBinderContext* ctx);

/* Genuine ServiceManager client operations */
int lotify_servicemanager_check_service(LotifyBinderContext* ctx, const char* name, uint32_t* out_handle);
int lotify_servicemanager_get_service(LotifyBinderContext* ctx, const char* name, uint32_t* out_handle);
int lotify_servicemanager_ping_binder(LotifyBinderContext* ctx, uint32_t handle);

/* Diagnostic string for errors */
const char* lotify_binder_strerror(int err_code);

#ifdef __cplusplus
}
#endif

#endif /* LOTIFY_SERVICEMANAGER_SHIM_H */
