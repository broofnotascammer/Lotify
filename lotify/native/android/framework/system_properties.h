/**
 * Android System Properties Native Interface
 * Matches AOSP bionic/libc/include/sys/system_properties.h
 * Target: Android 14 (android-14.0.0_r50)
 */

#ifndef LOTIFY_SYSTEM_PROPERTIES_H
#define LOTIFY_SYSTEM_PROPERTIES_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

#define PROP_NAME_MAX 32
#define PROP_VALUE_MAX 92
#define PROP_NAME_MAX_MODERN 128

typedef struct prop_info prop_info;

/* Standard Android Bionic libc signatures */
int __system_property_get(const char* name, char* value);
int __system_property_set(const char* key, const char* value);
const prop_info* __system_property_find(const char* name);
int __system_property_read(const prop_info* pi, char* name, char* value);
void __system_property_read_callback(
    const prop_info* pi,
    void (*callback)(void* cookie, const char* name, const char* value, uint32_t serial),
    void* cookie
);
int __system_property_foreach(
    void (*propfn)(const prop_info* pi, void* cookie),
    void* cookie
);
uint32_t __system_property_area_serial(void);
uint32_t __system_property_serial(const prop_info* pi);

/* Lotify property subsystem lifecycle */
int lotify_system_properties_init(const char* build_prop_path);
int lotify_system_properties_count(void);
void lotify_system_properties_shutdown(void);
int lotify_system_properties_validate_name(const char* name);

#ifdef __cplusplus
}
#endif

#endif /* LOTIFY_SYSTEM_PROPERTIES_H */
