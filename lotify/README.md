# Lotify — Linux-native Android Spotify Compatibility Platform

> **Version:** 0.1.0  
> **Target Architecture:** x86-64 Linux (Arch Linux / Fedora / Ubuntu)  
> **Desktop Environment:** KDE Plasma / GNOME (X11 & Wayland)  
> **Audio Backend:** PipeWire  
> **Graphics Acceleration:** EGL / OpenGL ES 3.0+ (Mesa Intel HD 4000 & NVIDIA PRIME)

---

## 1. Executive Summary

**Lotify** executes the official x86-64 Android release of Spotify natively on Linux through a specialized compatibility runtime. Inspired by the low-overhead architectural philosophy of [VinegarHQ's Sober](https://sober.vinegarhq.net), Lotify does **not** rely on full virtualized QEMU/KVM system emulators (e.g. Waydroid, Genymotion, or Android-x86), nor does it run a Spotify web/Electron wrapper.

Instead, Lotify implements a lightweight, capability-based compatibility layer directly above the Linux kernel:
- **Android Runtime (ART):** Direct host-native execution of DEX bytecode and JNI bridges.
- **Bionic Libc & Dynamic Linker:** Custom isolated loader and dynamic linker for Android ELF libraries (`libspotify.so`, `liborbit-jni.so`).
- **Audio Subsystem:** Direct Android `AudioTrack` translation into native low-latency PipeWire PCM streams.
- **Graphics Pipeline:** Zero-copy EGL context sharing and OpenGL ES 3.0 rendering routed to Mesa DRI / X11 / Wayland compositors.
- **Desktop Interop:** Android `MediaSession` events bridge directly into Linux D-Bus MPRIS v2 (`org.mpris.MediaPlayer2.Lotify`) for native multimedia key control, lock-screen controls, and system tray integration.

---

## 2. Monorepo Structure

```text
lotify/
├── apps/
│   └── lotify-gtk/            # GTK 4 + Libadwaita desktop launcher
├── crates/
│   ├── lotify-core/           # Runtime state machine, lifecycle, events
│   ├── lotify-protocol/       # Unix domain socket framing & Protobuf IPC
│   ├── lotify-config/         # TOML configuration loading and schema validation
│   ├── lotify-logging/        # Structured tracing subscriber & UI ringbuffer
│   ├── lotify-errors/         # Hierarchical domain error definitions (thiserror)
│   ├── lotify-supervisor/     # Daemon process supervisor & sandbox boundaries
│   ├── lotify-apk/            # Static APK inspector (DEX magic, AXML, ABIs)
│   ├── lotify-doctor/         # Linux host diagnostics & hardware capability auditor
│   └── ...
├── protocols/                 # Protocol Buffers (.proto) definitions
├── profiles/                  # Application profiles (Spotify specific configuration)
├── packaging/                 # Flatpak, systemd user service, and desktop entries
└── docs/                      # Technical documentation and specifications
```

---

## 3. Arch Linux Build Instructions

### Prerequisites

```bash
sudo pacman -S --needed \
    base-devel \
    rust \
    cargo \
    gtk4 \
    libadwaita \
    pipewire \
    mesa \
    protobuf \
    meson \
    ninja
```

### Building the Workspace

```bash
# Clone the repository
git clone https://github.com/lotify/lotify.git
cd lotify

# Run host diagnostics
cargo run --bin lotify-doctor

# Build all workspace crates
cargo build --release

# Inspect an x86_64 Spotify APK
cargo run --bin apk-inspect -- /path/to/spotify-x86_64.apk

# Launch the GTK 4 Desktop Launcher
cargo run --bin lotify-gtk
```

---

## 4. Security & Isolation

- **Zero Credential Tampering:** Lotify does not intercept TLS certificates, bypass DRM, or modify Spotify binaries.
- **User-Provided APKs:** Spotify APKs must be legally obtained and placed by the user.
- **Process Isolation:** The runtime daemon executes within unprivileged Linux namespaces (`CLONE_NEWNS`, `CLONE_NEWPID`, `CLONE_NEWIPC`) with seccomp-bpf filters restricting unnecessary syscalls.
