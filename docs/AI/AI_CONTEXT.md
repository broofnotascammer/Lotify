# AI Context & Handoff Guide

## 1. Project Purpose
This document enables any AI system, engineer, or automated agent to immediately resume work on Lotify without prior conversation history.

## 2. Pinned Technical Baseline
- **Android Target**: AOSP Android 14 (`android-14.0.0_r50`, API 34).
- **Target Application**: Official Spotify Android application (`com.spotify.music`, x86-64 APK).
- **Host Stack**: Arch Linux x86-64, glibc, Rust (Cargo workspace), GTK 4 + Libadwaita, PipeWire audio, Mesa EGL graphics.
- **Android Runtime**: AOSP ART, Bionic libc, genuine Binder IPC (`/dev/binderfs/binder`).
- **Core Principle**: Smallest practical runtime, zero busy-waiting, native Linux desktop integration.

## 3. Strict Rules
- Do NOT convert this project into a web wrapper, Electron app, or QEMU/KVM virtual machine.
- Do NOT report simulated behavior as PASS.
- Do NOT skip ActivityManager (Milestone 3.2) or PackageManager (Milestone 3.3) before launching apps.
- Unreached benchmark stages must remain marked `NOT MEASURED`.
