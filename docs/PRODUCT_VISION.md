# Lotify 1.0 — Product Vision

## 1. Core Mission
Lotify is a lightweight, Linux-native Android application compatibility platform. Its primary objective is to execute the official Android Spotify application (`com.spotify.music`) on Linux through an isolated compatibility runtime, inspired by the engineering philosophy of VinegarHQ's Sober.

## 2. Why Lotify Exists
Current alternatives on Linux are unsatisfactory:
- **Spotify Web Player / Web Wrappers**: Lack offline downloads, high-bitrate local audio caching, hardware media key integration, and proper volume normalization.
- **Electron Desktop Client**: Consumes 400MB+ RAM, carries an entire embedded Chromium engine, and suffers from heavy idle background resource consumption.
- **Conventional Android Emulators (Waydroid, Android-x86, QEMU/KVM)**: Require running an entire virtual machine or heavyweight multi-GB Android desktop OS with virtual displays, cellular telephony daemons, camera HALs, and multi-second boot times.

Lotify provides an alternative:
- **Low CPU overhead**: `< 0.1%` idle host CPU via event-driven non-blocking `poll(2)` loops.
- **Low RAM consumption**: Target `< 100 MB` baseline runtime footprint, dynamically budgeting the ART managed heap.
- **Minimal disk writes**: Immutable shared framework assets, zero repetitive re-extraction.
- **Instant startup**: Sub-100ms runtime initialization; no virtual machine boot delay.
- **Native desktop integration**: MPRIS v2 media controls, PipeWire bit-perfect audio graph synchronization, KDE/GNOME notifications.
- **Hardware adaptive**: Runs smoothly on older machines (MacBookPro9,1 Ivy Bridge Intel HD 4000 baseline) and scales up to modern hardware with AVX2 and hardware ASTC.
- **Reusable platform**: Validated on Spotify first, then extensible to other compatible Android applications.
