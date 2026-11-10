# Lotify 1.0 — Security Specification

## 1. Process Isolation & Sandboxing
Lotify isolates Android application processes using standard Linux unprivileged user namespaces:
- **Mount Namespace**: Private `/proc`, `/sys`, and `/dev` views. Android applications cannot view host system files.
- **PID Namespace**: Child process sees itself as PID 1 inside the Android container jail.
- **IPC Namespace**: POSIX and System V IPC queues are isolated from the host.
- **Network Namespace**: Shared by default with the host for Spotify internet access, with configurable loopback isolation.

## 2. Binder Device Node Security
- Never assign world-writable permissions (`0666`) to `/dev/binderfs/binder`.
- Correct setup uses a dedicated desktop group:
  ```bash
  sudo chown root:lotify /dev/binderfs/binder
  sudo chmod 0660 /dev/binderfs/binder
  ```
- User running `lotify-gtk` must be a member of the `lotify` group.

## 3. Property Service Security
- Read-only properties (`ro.*`) are immutable post-initialization. Any mutation attempt triggers `errno = EACCES`.
- Mutable property updates must originate from authorized processes or pass through `/dev/socket/property_service`.
