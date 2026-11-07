# Lotify Security Architecture

## 1. Principles
- **No DRM or Account Bypass:** Lotify does not modify Spotify cryptographic handshakes or DRM routines.
- **No TLS Interception:** Network traffic from `com.spotify.music` flows uninspected and untampered to Spotify servers.
- **No Bundled Proprietary Binaries:** The repository contains zero proprietary APKs, DEX files, or proprietary `.so` libraries.
- **Restricted Sandbox:** Applications execute with their own isolated data directories (`$XDG_DATA_HOME/lotify/apps/com.spotify.music/data`).
- **Linux Namespaces:** The supervisor uses `unshare()` for mount, IPC, and PID isolation to prevent unauthorized access to host user home directories.
