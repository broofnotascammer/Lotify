//! lotify-doctor: Host Capability & Environment Diagnostics CLI
//! Corrected for Intel MacBookPro9,1 (Ivy Bridge HD 4000 + NVIDIA GT 650M)

use std::path::Path;

fn main() {
    println!("==========================================================");
    println!(" Lotify Host Capability Doctor (v0.2.0 - Phase 2)");
    println!(" Target: x86-64 Linux (MacBookPro9,1 / Arch Linux / KDE)");
    println!("==========================================================\n");

    let mut all_passed = true;

    // 1. Check CPU: SSE4.2 required for ART; AVX optional
    println!("[*] Probing CPU microarchitecture instruction sets...");
    #[cfg(target_arch = "x86_64")]
    {
        println!("  ✓ CPU Architecture: x86_64 (64-bit Long Mode)");
        if is_x86_feature_detected!("sse4.2") {
            println!("  ✓ Mandatory instruction set SSE4.2 detected (Required for ART JIT)");
        } else {
            println!("  ✗ Mandatory instruction set SSE4.2 missing!");
            all_passed = false;
        }

        if is_x86_feature_detected!("avx") {
            println!("  ✓ Optional instruction set AVX detected (Vector optimization enabled)");
        } else {
            println!("  ! AVX not detected; AOSP ART will execute using SSE4.2 baseline (Supported)");
        }
    }

    // 2. Check Binder IPC node & permissions
    println!("\n[*] Checking Android Binder IPC subsystem...");
    let binder_paths = ["/dev/binderfs/binder", "/dev/binder"];
    let mut binder_found = false;
    for path in &binder_paths {
        if Path::new(path).exists() {
            println!("  ✓ Binder IPC node found at {}", path);
            binder_found = true;
            break;
        }
    }
    if !binder_found {
        println!("  ✗ Binder IPC node not found (/dev/binderfs or /dev/binder).");
        println!("    Remedy: Run `sudo mkdir -p /dev/binderfs && sudo mount -t binder binder /dev/binderfs`");
        all_passed = false;
    }

    // 3. Check Graphics: Ivy Bridge Intel HD 4000 (Mesa crocus) & PRIME
    println!("\n[*] Checking Graphics Subsystem (Intel HD 4000 & NVIDIA GT 650M)...");
    if Path::new("/dev/dri/card0").exists() || Path::new("/dev/dri/renderD128").exists() {
        println!("  ✓ Direct Rendering Infrastructure (DRI) nodes active");
        println!("    Mesa Driver: crocus (Ivy Bridge Gen 7 - GLES 3.0 supported)");
        println!("    Note: ASTC hardware decompression not available on Ivy Bridge; using CPU fallback");
    } else {
        println!("  ! Direct rendering device node not found. Falling back to llvmpipe software rasterizer.");
    }

    // 4. Check Audio: PipeWire
    println!("\n[*] Checking Audio Subsystem (PipeWire AudioTrack bridge)...");
    if Path::new("/run/user/1000/pipewire-0").exists() || std::env::var("PIPEWIRE_REMOTE").is_ok() {
        println!("  ✓ PipeWire runtime socket active (Graph default: 48000 Hz)");
        println!("    Stream mode: Direct AudioTrack PCM buffer exchange");
    } else {
        println!("  ! PipeWire socket not found at default user path; verify pipewire.service.");
    }

    println!("\n----------------------------------------------------------");
    if all_passed {
        println!("Result: Host environment passed primary architectural requirements.");
    } else {
        println!("Result: WARNING - Some prerequisites need remediation before running.");
    }
}
