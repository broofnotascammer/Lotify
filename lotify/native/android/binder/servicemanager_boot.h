/**
 * Lotify AOSP ServiceManager Boot & Context Manager
 * Strict Android 14 (android-14.0.0_r50) Handle 0 Lifecycle & Transaction Dispatcher
 *
 * Architecture & Coexistence Rules:
 * 1. Prefer genuine AOSP servicemanager:
 *    In Android 14, AOSP servicemanager is implemented in Rust
 *    (frameworks/native/cmds/servicemanager/main.rs) and executes as /system/bin/servicemanager.
 *    Lotify's supervisor boots the genuine AOSP binary within the isolated Android rootfs.
 *    Lotify MUST NOT register as context manager if an actual AOSP servicemanager owns Handle 0.
 * 2. Host-side Context Manager Shim:
 *    When running in isolated host development mode (without full AOSP rootfs), Lotify provides
 *    a fully compliant Handle 0 transaction looper implementing AIDL IServiceManager protocol
 *    to service Binder clients without busy-waiting.
 */

#ifndef LOTIFY_SERVICEMANAGER_BOOT_H
#define LOTIFY_SERVICEMANAGER_BOOT_H

#include <stdint.h>
#include <stddef.h>
#include "servicemanager_shim.h"

#ifdef __cplusplus
extern "C" {
#endif

#define LOTIFY_MAX_REGISTERED_SERVICES 64

typedef struct {
    char name[64];
    uint32_t handle;
    int allow_isolated;
    int dump_priority;
} LotifyRegisteredService;

typedef struct {
    int binder_fd;
    void* vm_addr;
    size_t vm_size;
    int is_context_manager;
    int looper_registered; // BC_ENTER_LOOPER completed
    char device_path[256];
    uint32_t max_threads;
    uint32_t active_service_count;
    LotifyRegisteredService services[LOTIFY_MAX_REGISTERED_SERVICES];
} LotifyServiceManagerBoot;

/**
 * Probes whether the host environment supports Binder context-manager registration.
 * Distinguishes native Arch Linux with binderfs from development container sandbox.
 */
int lotify_servicemanager_probe_host_feasibility(
    const char* preferred_path,
    int* out_driver_present,
    int* out_can_be_context_mgr,
    char* out_diagnostic,
    size_t diag_size
);

/**
 * Initializes and bootstraps this process as the ServiceManager (Handle 0).
 * Issues BINDER_SET_CONTEXT_MGR to kernel binder driver and sends BC_ENTER_LOOPER.
 * If another process already owns Handle 0 (EBUSY), returns LOTIFY_BINDER_ERR_ALREADY_OWNED.
 */
int lotify_servicemanager_boot_as_context_mgr(
    LotifyServiceManagerBoot* sm,
    const char* binder_path
);

/**
 * Registers a service locally in the ServiceManager registry.
 */
int lotify_servicemanager_register_local_service(
    LotifyServiceManagerBoot* sm,
    const char* name,
    uint32_t handle,
    int allow_isolated,
    int dump_priority
);

/**
 * Runs one iteration of the ServiceManager event loop using poll(2) with timeout.
 * Zero CPU overhead during idle: blocks cleanly in kernel poll.
 * When data is available, decodes incoming BR_TRANSACTION, dispatches IServiceManager AIDL
 * requests (getService, checkService, addService, listServices, ping), and sends BC_REPLY.
 */
int lotify_servicemanager_looper_step(
    LotifyServiceManagerBoot* sm,
    int timeout_ms
);

/**
 * Shuts down the ServiceManager, sends BC_EXIT_LOOPER, and releases memory/device mappings.
 */
void lotify_servicemanager_shutdown(LotifyServiceManagerBoot* sm);

#ifdef __cplusplus
}
#endif

#endif /* LOTIFY_SERVICEMANAGER_BOOT_H */

