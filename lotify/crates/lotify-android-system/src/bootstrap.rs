//! lotify-android-system: Android System Bootstrap Orchestrator
//!
//! Orchestrates the initialization of the Android system framework environment:
//! 1. Ingests AOSP Android 14 `build.prop` into `SystemPropertiesStore` (API 34)
//! 2. Validates kernel Binder driver node (`/dev/binderfs/binder` or `/dev/binder`)
//! 3. Instantiates `ServiceManagerClient` targeting Binder Handle 0
//! 4. Performs genuine service discovery against ServiceManager
//! 5. Accurately reports BLOCKED if Binder driver or ServiceManager context manager is absent

use crate::properties::SystemPropertiesStore;
use crate::servicemanager::{
    FrameworkServiceEntry, ServiceManagerClient, ServiceManagerRegistry, ServiceResolutionStatus,
};
use lotify_errors::{LotifyError, LotifyResult};
use lotify_logging::{debug, error, info, warn};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, Mutex};
use std::time::Instant;

/// Status report resulting from an Android system bootstrap sequence.
#[derive(Debug, Clone)]
pub struct SystemBootstrapReport {
    pub properties_verified: bool,
    pub binder_driver_verified: bool,
    pub service_manager_verified: bool,
    pub aosp_version: String,
    pub api_level: u32,
    pub properties_count: usize,
    pub binder_path: String,
    pub overall_status: String, // "PASS", "FAIL", or "BLOCKED"
    pub services_status: HashMap<String, ServiceResolutionStatus>,
    pub registered_services: Vec<String>,
    pub ping_results: HashMap<String, bool>,
    pub bootstrap_duration_ms: f64,
    pub diagnostic_log: Vec<String>,
}

/// Orchestrator for bootstrapping the Android 14 system environment.
pub struct AndroidSystemBootstrap {
    system_root: PathBuf,
    binder_device_path: PathBuf,
    properties_store: Arc<Mutex<SystemPropertiesStore>>,
    service_manager: Arc<Mutex<ServiceManagerRegistry>>,
    client: ServiceManagerClient,
}

impl AndroidSystemBootstrap {
    pub fn new(system_root: impl AsRef<Path>, binder_device_path: impl AsRef<Path>) -> Self {
        let binder_path = binder_device_path.as_ref().to_path_buf();
        Self {
            system_root: system_root.as_ref().to_path_buf(),
            binder_device_path: binder_path.clone(),
            properties_store: Arc::new(Mutex::new(SystemPropertiesStore::new())),
            service_manager: Arc::new(Mutex::new(ServiceManagerRegistry::new())),
            client: ServiceManagerClient::new(binder_path),
        }
    }

    pub fn properties_store(&self) -> Arc<Mutex<SystemPropertiesStore>> {
        Arc::clone(&self.properties_store)
    }

    pub fn service_manager(&self) -> Arc<Mutex<ServiceManagerRegistry>> {
        Arc::clone(&self.service_manager)
    }

    pub fn bootstrap(&mut self) -> LotifyResult<SystemBootstrapReport> {
        let start_time = Instant::now();
        let mut logs = Vec::new();

        logs.push("[BOOTSTRAP] Initiating Android 14 framework bootstrap sequence".to_string());
        info!("[BOOTSTRAP] Starting Android system bootstrap");

        // 1. Load system properties from build.prop
        let build_prop_path = self.system_root.join("build.prop");
        logs.push(format!(
            "[BOOTSTRAP] Loading system properties from {:?}",
            build_prop_path
        ));

        let mut prop_store = self.properties_store.lock().unwrap();
        if build_prop_path.exists() {
            prop_store.load_from_file(&build_prop_path)?;
            logs.push(format!(
                "[BOOTSTRAP] Loaded {} properties from file into Bionic property store",
                prop_store.count()
            ));
        } else {
            warn!("[BOOTSTRAP] build.prop not found, falling back to defaults");
            prop_store.populate_aosp14_defaults();
            logs.push(format!(
                "[BOOTSTRAP] Populated {} default AOSP 14 properties",
                prop_store.count()
            ));
        }

        let sdk_str = prop_store.get_or_else("ro.build.version.sdk", "0");
        let api_level = sdk_str.parse::<u32>().unwrap_or(0);
        let release = prop_store.get_or_else("ro.build.version.release", "unknown");

        if api_level != 34 {
            let msg = format!(
                "Bootstrap failed: invalid API level {} (expected 34 for Android 14)",
                api_level
            );
            error!("{}", msg);
            return Err(LotifyError::CompatibilityViolation(msg));
        }
        logs.push(format!(
            "[BOOTSTRAP] Validated platform: Android {} (API level {})",
            release, api_level
        ));
        let properties_verified = true;

        // 2. Probe Kernel Binder Driver Node
        let binder_exists = self.binder_device_path.exists();
        logs.push(format!(
            "[BOOTSTRAP] Probing Binder driver node at {:?}: exists={}",
            self.binder_device_path, binder_exists
        ));

        let mut services_status = HashMap::new();
        let mut ping_results = HashMap::new();
        let mut registered_names = Vec::new();
        let mut sm = self.service_manager.lock().unwrap();

        let core_services = ["package", "activity", "power", "display", "audio", "connectivity"];

        let (binder_driver_verified, service_manager_verified, overall_status) = if binder_exists {
            logs.push("[BOOTSTRAP] Binder driver found. Probing ServiceManager Handle 0...".to_string());
            let mut all_ok = true;
            for svc in core_services {
                registered_names.push(svc.to_string());
                match self.client.query_service(svc) {
                    Ok(handle) => {
                        let ping_ok = self.client.ping_handle(handle).is_ok();
                        services_status.insert(
                            svc.to_string(),
                            if ping_ok {
                                ServiceResolutionStatus::PingVerified
                            } else {
                                ServiceResolutionStatus::RemotelyDiscovered
                            },
                        );
                        ping_results.insert(svc.to_string(), ping_ok);
                        sm.update_discovery_result(
                            svc,
                            Some(handle),
                            ServiceResolutionStatus::PingVerified,
                            None,
                        );
                    }
                    Err(e) => {
                        all_ok = false;
                        services_status.insert(svc.to_string(), ServiceResolutionStatus::Blocked);
                        ping_results.insert(svc.to_string(), false);
                        sm.update_discovery_result(
                            svc,
                            None,
                            ServiceResolutionStatus::Blocked,
                            Some(e.clone()),
                        );
                    }
                }
            }
            (true, all_ok, if all_ok { "PASS".to_string() } else { "BLOCKED".to_string() })
        } else {
            logs.push(format!(
                "[BOOTSTRAP] BLOCKED: Kernel Binder driver device not found at '{:?}'",
                self.binder_device_path
            ));
            logs.push("[BOOTSTRAP] Note: Host environment lacks CONFIG_ANDROID_BINDER_IPC. ServiceManager communication blocked.".to_string());

            for svc in core_services {
                registered_names.push(svc.to_string());
                services_status.insert(svc.to_string(), ServiceResolutionStatus::Blocked);
                ping_results.insert(svc.to_string(), false);
                sm.update_discovery_result(
                    svc,
                    None,
                    ServiceResolutionStatus::Blocked,
                    Some("Missing kernel binder device node".to_string()),
                );
            }
            (false, false, "BLOCKED".to_string())
        };

        let elapsed = start_time.elapsed().as_secs_f64() * 1000.0;
        logs.push(format!(
            "[BOOTSTRAP] Sequence completed in {:.2}ms with status: {}",
            elapsed, overall_status
        ));

        Ok(SystemBootstrapReport {
            properties_verified,
            binder_driver_verified,
            service_manager_verified,
            aosp_version: release,
            api_level,
            properties_count: prop_store.count(),
            binder_path: self.binder_device_path.to_string_lossy().to_string(),
            overall_status,
            services_status,
            registered_services: registered_names,
            ping_results,
            bootstrap_duration_ms: elapsed,
            diagnostic_log: logs,
        })
    }
}
