# Building Lotify v0.1.0 on Arch Linux

## 1. System Requirements

- **OS:** Arch Linux (kernel 6.1 or newer recommended)
- **CPU:** Intel or AMD x86-64 processor supporting SSE4.2 and AVX
- **GPU:** Intel HD Graphics 4000 (Ivy Bridge) or newer, or NVIDIA GeForce with PRIME offload
- **Memory:** 4 GB minimum (8 GB recommended)

## 2. Kernel Setup for Android Binder

Lotify uses Linux's in-tree Android Binder IPC driver. On modern Arch Linux kernels, `binderfs` is enabled by default:

```bash
# Verify binderfs is mounted
ls -l /dev/binderfs

# If not mounted, create mount point and mount binderfs:
sudo mkdir -p /dev/binderfs
sudo mount -t binder binder /dev/binderfs

# To make persistent, add to /etc/fstab:
# binder /dev/binderfs binder default 0 0
```

## 3. Install Host Dependencies

```bash
sudo pacman -S --needed \
    base-devel \
    rust \
    cargo \
    gtk4 \
    libadwaita \
    pipewire \
    pipewire-pulse \
    pipewire-alsa \
    mesa \
    vulkan-intel \
    protobuf \
    ninja \
    meson
```

## 4. Compile the Workspace

```bash
git clone https://github.com/lotify/lotify.git
cd lotify

# Validate your hardware and kernel
cargo run --bin lotify-doctor

# Run test suites
cargo test --workspace

# Build optimized release binaries
cargo build --release
```

## 5. Artifacts Produced

- `target/release/lotify-gtk`: GTK 4 Desktop GUI Launcher
- `target/release/lotifyd`: Runtime Supervisor Daemon
- `target/release/lotify-doctor`: System Diagnostics CLI tool
- `target/release/apk-inspect`: APK metadata analyzer CLI tool
