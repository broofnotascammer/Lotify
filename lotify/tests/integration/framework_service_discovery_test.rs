//! Integration test: Android Framework Service Discovery & IBinder Ping Validation
//!
//! Mirrors native acceptance test `FrameworkBootstrapTest.java` for Milestone 3.1.1:
//! 1. Parses `/lotify/android-platform/system/build.prop`
//! 2. Verifies API 34 (Android 14) and x86_64 target
//! 3. Probes ServiceManager (Handle 0) client
//! 4. Verifies genuine error detection when Binder driver is absent (BLOCKED)
//! 5. Validates host bridge configurations (PipeWire 48k negotiation, Ivy Bridge ASTC CPU fallback)

use lotify_android_system::{AndroidSystemBootstrap, ServiceResolutionStatus};
use lotify_framework_bridge::{AudioServiceBridge, ConnectivityManagerBridge, DisplayManagerBridge};
use std::path::PathBuf;

#[test]
fn test_framework_bootstrap_and_service_discovery() {
    let system_root = PathBuf::from("lotify/android-platform/system");
    let binder_device = PathBuf::from("/dev/binderfs/binder");

    let mut bootstrap = AndroidSystemBootstrap::new(&system_root, &binder_device);
    let report = bootstrap.bootstrap().expect("System bootstrap execution failed");

    // Acceptance Criteria 1: Bionic System Properties Verification
    assert!(report.properties_verified, "Properties should be verified");
    assert_eq!(report.api_level, 34, "Expected API level 34 (Android 14)");
    assert_eq!(report.aosp_version, "14", "Expected AOSP version 14");
    assert!(report.properties_count >= 10, "Expected at least 10 properties");

    // Acceptance Criteria 2: Genuine Binder Driver Probing
    // If running in sandbox environment without /dev/binderfs/binder, must report BLOCKED
    if !binder_device.exists() {
        assert!(!report.binder_driver_verified, "Driver should be reported unverified when absent");
        assert_eq!(report.overall_status, "BLOCKED");

        // Services should be classified as Blocked
        for svc in &report.registered_services {
            let status = report.services_status.get(svc).copied();
            assert_eq!(status, Some(ServiceResolutionStatus::Blocked));
            let ping_ok = report.ping_results.get(svc).copied().unwrap_or(false);
            assert!(!ping_ok, "Ping must not be fabricated as successful when driver is absent");
        }
    }

    // Acceptance Criteria 3: Host bridges validation
    let mut audio_bridge = AudioServiceBridge::new();
    let audio_cfg = audio_bridge.configure_stream("STREAM_MUSIC", 44100, 2).unwrap();
    assert_eq!(audio_cfg.sample_rate_hz, 44100);
    assert_eq!(audio_cfg.pipewire_graph_rate_hz, 48000);
    assert!(audio_cfg.resampling_active, "PipeWire 48k resampler should be active for 44.1k");

    let display_bridge = DisplayManagerBridge::new();
    let disp = display_bridge.get_default_display();
    assert_eq!(disp.width, 1440);
    assert_eq!(disp.height, 900);
    assert!(!disp.astc_hardware_supported, "Ivy Bridge lacks ASTC hardware decompression");
    assert!(disp.astc_software_fallback, "Software ASTC fallback must be enabled");

    let conn_bridge = ConnectivityManagerBridge::new();
    let net = conn_bridge.get_active_network();
    assert!(net.is_connected);
    assert!(net.has_internet);
    assert!(!net.is_metered);
}
