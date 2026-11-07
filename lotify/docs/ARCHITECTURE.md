# Lotify System Architecture (v0.1.0)

## 1. High-Level Architecture

```text
+-------------------------------------------------------------+
|             GTK 4 / Libadwaita Desktop Launcher             |
|                 (apps/lotify-gtk - Rust)                    |
+-------------------------------------------------------------+
                               |
              Unix-Domain Socket (`/run/user/$UID/lotify/daemon.sock`)
              Framed Protocol Buffers (`lotify.protocol.*`)
                               |
                               v
+-------------------------------------------------------------+
|                   Lotify Runtime Daemon                     |
|              (crates/lotify-supervisor - Rust)              |
|                                                             |
|  +------------------------+    +-------------------------+  |
|  | State Machine & Safety |    |   Cgroup & Namespaces   |  |
|  +------------------------+    +-------------------------+  |
+-------------------------------------------------------------+
                               |
               Process Spawn & Sandbox Jail
                               |
                               v
+-------------------------------------------------------------+
|               Android Compatibility Container               |
|                                                             |
|   +-------------------+  +-------------------------------+  |
|   |  AOSP ART Runtime |  | Custom Bionic Dynamic Linker  |  |
|   +-------------------+  +-------------------------------+  |
|   |  JNI & Framework  |  | Binder IPC (/dev/binderfs)    |  |
|   +-------------------+  +-------------------------------+  |
|                                                             |
|   +-----------------------------------------------------+   |
|   |        Genuine Spotify x86-64 Android App           |   |
|   |        (`libspotify.so`, `classes.dex`, JNI)         |   |
|   +-----------------------------------------------------+   |
+-------------------------------------------------------------+
         |                                 |
         | AudioTrack PCM                  | GLES / Surface
         v                                 v
+------------------------+       +----------------------------+
|  Lotify Audio Bridge   |       |  Lotify Graphics Bridge    |
|   (libpipewire-0.3)    |       |  (Mesa EGL / X11 / Wayland)|
+------------------------+       +----------------------------+
         |                                 |
         v                                 v
  Linux Sound System             Linux Desktop Compositor
  (PipeWire / ALSA)              (KDE KWin / GNOME Mutter)
```

## 2. Key Architectural Decisions

1. **Native x86-64 Execution vs Emulation:**
   Android APKs distributed for x86-64 contain native 64-bit x86 ELF shared objects. Lotify links them directly against a specialized Bionic compatibility shim on the host Linux kernel, eliminating CPU emulation penalties.

2. **Decoupled GTK 4 Client & Daemon:**
   The GTK 4 interface is a pure desktop client that can crash, restart, or be closed without terminating active Spotify background playback. The supervisor daemon runs as a systemd user unit or background supervisor.

3. **Bit-Perfect Audio Routing:**
   Unlike generic Android emulators that resample Android audio to 44.1kHz and then pulse resamples to 48kHz, Lotify negotiates native PipeWire stream formats directly from the Android AudioTrack buffer.
