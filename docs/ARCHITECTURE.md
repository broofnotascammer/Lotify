# Lotify 1.0 — Architecture Specification

## 1. High-Level Architectural Model

Lotify is a lightweight, Linux-native Android application compatibility platform. It does NOT run a full Android virtual machine with QEMU/KVM, nor is it a web wrapper or Electron client.

```text
+--------------------------------------------------------------------------+
|                  Linux Desktop Host (Arch Linux x86-64)                  |
|                                                                          |
|  +--------------------------------------------------------------------+  |
|  |           GTK 4 / Libadwaita Desktop Interface (Rust)              |  |
|  +--------------------------------------------------------------------+  |
|                                     |                                    |
|                      Unix Domain Socket (Framed IPC)                     |
|                                     v                                    |
|  +--------------------------------------------------------------------+  |
|  |             Lotify Supervisor Daemon (lotifyd - Rust)              |  |
|  |   - Process supervision & cgroups   - PipeWire audio bridge        |  |
|  |   - Dynamic hardware detection      - Mesa EGL display bridge      |  |
|  |   - MPRIS v2 D-Bus service          - Lifecycle management         |  |
|  +--------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
                                      |
                      Shared-Kernel Namespace Isolation
                                      v
+--------------------------------------------------------------------------+
|                 Isolated Android Userspace (API 34)                      |
|                                                                          |
|  +--------------------------+          +------------------------------+  |
|  |    Bionic Libc (x86-64)   |          |  AOSP ServiceManager (Rust)  |  |
|  |  - system properties     |          |  - Handle 0 Context Manager  |  |
|  |  - dynamic linker        |          |  - /system/bin/servicemanager|  |
|  +--------------------------+          +------------------------------+  |
|               |                                       |                  |
|               +-------------------+-------------------+                  |
|                                   v                                      |
|                     Kernel Binder IPC (/dev/binderfs)                    |
|                                   |                                      |
|  +--------------------------------------------------------------------+  |
|  |           Android Runtime (AOSP ART android-14.0.0_r50)            |  |
|  |   - x86-64 JIT / DEX compiler       - Strict memory budgeting      |  |
|  |   - Core Java libraries (core-oj)   - JNI native bridge            |  |
|  +--------------------------------------------------------------------+  |
|                                   |                                      |
|  +--------------------------------------------------------------------+  |
|  |                  Target Android Application                        |  |
|  |           Official Spotify APK (com.spotify.music)                 |  |
|  |   - x86-64 native shared libraries  - AudioTrack PCM stream        |  |
|  +--------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
```

## 2. Fundamental Architectural Boundaries

1. **Host ABI vs Android ABI**:
   - Host supervisor and desktop application run glibc x86-64 ABI.
   - Android application process runs genuine Bionic libc x86-64 ABI.
   - No attempt is made to replace Bionic with glibc; they coexist cleanly via namespace isolation.

2. **Genuine AOSP ServiceManager Coexistence**:
   - On the host, Lotify communicates as a client targeting Handle 0.
   - In the isolated Android environment, the genuine AOSP `servicemanager` binary (written in Rust in Android 14) registers Handle 0.
   - Lotify never creates a competing context manager if AOSP `servicemanager` is active.

3. **Event-Driven IPC & Zero Busy-Waiting**:
   - Host daemon and client communicate over non-blocking Unix domain sockets.
   - Binder transactions utilize kernel `poll(2)` event wakes, keeping idle CPU below 0.1%.
