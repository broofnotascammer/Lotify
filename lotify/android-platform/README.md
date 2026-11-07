# Lotify AOSP Platform Integration

## 1. Pinned Source Revision
Lotify pins the Android Open Source Project to **Android 14 (Revision `android-14.0.0_r50`)** with a target architecture of **x86-64**.

## 2. Why ART Cannot Be Compiled as a Cargo Dependency
Unlike desktop JVMs (e.g. OpenJDK / HotSpot), the Android Runtime (ART) is tightly coupled with:
1. **Bionic Libc:** Thread-local storage (TLS) layouts, pthread internal structures, and futex calling conventions.
2. **Android Dynamic Linker (`linker64`):** Linker namespaces, ELF DT_RUNPATH handling, and soname resolution.
3. **Boot Images (`boot.art`):** Pre-compiled heap snapshots containing essential classes (`java.lang.Object`, `java.lang.Class`).
4. **Soong Build System:** ART relies on complex Ninja generators (`bp2build`, `soong_build`) that cannot be compiled through `cargo build`.

Therefore, Lotify maintains AOSP as a separately pinned source dependency and packages the resulting binaries into the isolated Android runtime process environment.
