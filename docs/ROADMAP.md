# Lotify 1.0 — Development Roadmap

| Phase | Milestone | Focus Areas | Key Deliverables | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Native Linux Desktop App | GTK 4 + Libadwaita Interface | App shell, dashboard, APK inspector, settings, diagnostics, repo explorer | **IN PROGRESS** |
| **Phase 2** | Supervisor & Runtime Infra | Host Daemon & IPC | `lotifyd` daemon, Unix domain socket, framed protocol, namespace sandboxing, crash recovery | **IN PROGRESS** |
| **Phase 3** | Android Compatibility | 3.1 Foundation (Bionic & Binder) | Android 14 Bionic properties, Handle 0 ServiceManager, kernel Binder feasibility | **AUDITED / BLOCKED ON BINDERFS** |
| | | 3.2 ActivityManager | `IActivityManager` AIDL, `ApplicationThread`, process initialization, lifecycle state machine | **UPCOMING** |
| | | 3.3 PackageManager | APK parsing, package directory staging, permissions, intent resolution, metadata | **UPCOMING** |
| | | 3.4 Application Execution | Spotify APK execution, native x86-64 library loading (`libspotify.so`), Activity launching | **UPCOMING** |
| | | 3.5 Audio & Media Bridge | PipeWire `libspa-speexresample` AudioTrack bridge, MPRIS v2 D-Bus service, media keys | **IN PROGRESS** |
| | | 3.6 Graphics Bridge | Mesa EGL context, GLES 3.0, ASTC software CPU decompression fallback | **IN PROGRESS** |
| **Phase 4** | Performance Optimization | CPU, Memory, Disk & Audio | Sub-0.1% idle CPU verification, bounded memory RSS, sub-10µs IPC framing | **IN PROGRESS** |
| **Phase 5** | Production Application | Packaging, Distribution & Handoff | Arch PKGBUILD, Flatpak manifest, AI handoff exporter (`lotify handoff export`) | **UPCOMING** |
