# AI Context — Current State (Phase 3.1.2.1 Audit)

## 1. Verified Working Functionality
- **Native Bionic System Properties**: 37 properties loaded from `build.prop`; full C API implemented (`__system_property_get`, `__system_property_set`, `__system_property_find`, `__system_property_read_callback`, `__system_property_foreach`, `__system_property_serial`, `__system_property_area_serial`). Post-boot `ro.*` mutations rejected with `errno = EACCES`. Verified via `test_native_bootstrap.c` under GCC.
- **ServiceManager Bootloader & Looper**: Handle 0 registration, `BC_ENTER_LOOPER` thread pool registration, non-blocking `poll(2)` event loop, Parcel serialization/deserialization for `IServiceManager` AIDL, and ping response.
- **Hardware Capability Detection**: Probing CPU SIMD (SSE4.2, AVX1 on Ivy Bridge; AVX2/FMA on modern hosts), adaptive ART managed heap scaling (256/512/768MB), Mesa GPU driver detection, and ASTC software CPU decompression fallback.
- **Performance Benchmarking Suite**: 9 metrics evaluated across 5 runtime states; States 1 & 2 measured live, States 3–5 strictly marked `NOT MEASURED`.
- **GTK 4 / Libadwaita Desktop Dashboard**: Overview, Benchmarks, System Bootstrap, ART Bootstrap, Supervisor, APK Inspector, Host Doctor, Settings, and Repository Explorer views.
- **Automated Test Coverage**: 35/35 TypeScript unit tests passing; 8/8 Native C tests passing.

## 2. Blocked Functionality
- **Kernel Binder Device Node**: Container environment runs `Linux 4.19.0-gvisor x86_64`, which does not implement character device ioctl for `/dev/binderfs/binder`. Accurately classified as `BLOCKED (CONTAINER_SANDBOX_LIMITATION)`.
- **AOSP Java Framework Classpath**: OpenJDK execution without compiled AOSP `framework.jar` bootclasspath correctly exits with status code 2 (`BLOCKED`).
