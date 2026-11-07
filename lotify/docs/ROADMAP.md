# Lotify Development Roadmap

| Phase | Milestone | Scope | Target Version |
|---|---|---|---|
| **Phase 0** | Research & Feasibility | AOSP components audit, x86-64 Spotify APK reverse engineering, binder feasibility | v0.0.1 |
| **Phase 1** | **Foundational Architecture** | **Cargo workspace, GTK 4 launcher, Daemon, IPC protocol, state machine, doctor CLI** | **v0.1.0 (Current)** |
| **Phase 2** | Application Management | Advanced APK manifest parser, signature check, local app catalog storage | v0.2.0 |
| **Phase 3** | Android Runtime Boot | Pinned AOSP ART initialization, JNI bootstrap, minimal hello-world DEX execution | v0.3.0 |
| **Phase 4** | Compatibility Shims | Binder IPC bridge, Activity lifecycle, Package Manager dummy services | v0.4.0 |
| **Phase 5** | Hardware Integration | PipeWire AudioTrack bridge, Intel HD 4000 EGL surface rendering, X11/Wayland input | v0.5.0 |
| **Phase 6** | Spotify Android Execution | Spotify APK loading, login session, background media stream execution | v0.6.0 |
| **Phase 7** | Linux Desktop Integration | MPRIS v2 D-Bus controller, KDE media keys, track artwork, tray icon | v0.7.0 |
| **Phase 8** | Distribution & Packaging | Flatpak manifest, systemd user services, AUR package for Arch Linux | v1.0.0 |
