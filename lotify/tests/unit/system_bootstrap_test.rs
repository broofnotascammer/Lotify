//! Unit tests for Android System Bootstrap, SystemProperties, and ServiceManager

use lotify_android_system::{
    FrameworkServiceEntry, ServiceManagerClient, ServiceManagerRegistry, ServiceResolutionStatus,
    SystemPropertiesStore, BINDER_HANDLE_SERVICE_MANAGER, BINDER_PING_TRANSACTION,
};
use std::fs;
use std::path::PathBuf;

#[test]
fn test_system_properties_defaults() {
    let mut store = SystemPropertiesStore::new();
    store.populate_aosp14_defaults();

    assert_eq!(store.get("ro.build.version.sdk"), Some("34"));
    assert_eq!(store.get("ro.build.version.release"), Some("14"));
    assert_eq!(store.get("ro.product.cpu.abi"), Some("x86_64"));
    assert_eq!(store.get("dalvik.vm.heapsize"), Some("768m"));
    assert!(store.count() >= 10);
}

#[test]
fn test_system_properties_file_load() {
    let temp_dir = std::env::temp_dir().join("lotify_test_prop");
    let _ = fs::create_dir_all(&temp_dir);
    let prop_file = temp_dir.join("build.prop");

    let prop_content = r#"
# Sample test build.prop
ro.build.version.sdk=34
ro.build.version.release=14
ro.product.model=Lotify Android 14 x86_64
ro.lotify.custom=enabled
"#;
    fs::write(&prop_file, prop_content).unwrap();

    let mut store = SystemPropertiesStore::new();
    store.load_from_file(&prop_file).unwrap();

    assert_eq!(store.get("ro.build.version.sdk"), Some("34"));
    assert_eq!(store.get("ro.lotify.custom"), Some("enabled"));
    assert_eq!(store.get_or_else("nonexistent", "fallback"), "fallback");

    let _ = fs::remove_dir_all(temp_dir);
}

#[test]
fn test_service_manager_registry_architecture() {
    let mut sm = ServiceManagerRegistry::new();

    // Verify declared services exist with LocallyConfigured status
    assert!(sm.count() >= 6);
    let pkg = sm.get_service("package").expect("package service should be declared");
    assert_eq!(pkg.status, ServiceResolutionStatus::LocallyConfigured);
    assert_eq!(pkg.interface_descriptor, "android.content.pm.IPackageManager");
    assert_eq!(pkg.assigned_handle, None);

    // Update with real discovery result
    sm.update_discovery_result("package", Some(10), ServiceResolutionStatus::PingVerified, None);
    let updated = sm.get_service("package").unwrap();
    assert_eq!(updated.status, ServiceResolutionStatus::PingVerified);
    assert_eq!(updated.assigned_handle, Some(10));
}

#[test]
fn test_service_manager_client_error_detection() {
    // When pointing to a non-existent binder device, client must report BLOCKED error
    let client = ServiceManagerClient::new("/dev/nonexistent_binder_node");
    assert!(!client.is_driver_available());

    let res = client.query_service("activity");
    assert!(res.is_err());
    assert!(res.unwrap_err().contains("BLOCKED"));

    let ping_res = client.ping_handle(1);
    assert!(ping_res.is_err());
    assert!(ping_res.unwrap_err().contains("BLOCKED"));
}
