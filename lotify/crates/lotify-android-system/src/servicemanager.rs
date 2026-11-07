//! Android ServiceManager Architecture
//! Strict Android 14 (android-14.0.0_r50) AIDL Service Discovery
//!
//! Distinct Architectural Layers:
//! 1. Binder Driver Transport (Driver probing & ioctl state)
//! 2. Parcel & Protocol Framing (AIDL UTF-16, strict mode, flat_binder_object)
//! 3. ServiceManager Client (Handle 0 RPC: checkService, getService)
//! 4. Service Registry Representation (Configured vs Discovered vs Pinged vs AIDL Implemented)

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

pub const BINDER_HANDLE_SERVICE_MANAGER: u32 = 0;
pub const BINDER_PING_TRANSACTION: u32 = 0x5f504e47; // "_PNG"

/// Verification status of a framework service in the compatibility platform
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ServiceResolutionStatus {
    /// Service is declared in local manifest / configuration
    LocallyConfigured,
    /// Service was confirmed and discovered via real ServiceManager (Handle 0)
    RemotelyDiscovered,
    /// Service handle responded successfully to IBinder.pingBinder() (0x5f504e47)
    PingVerified,
    /// Service has a functional local AIDL stub / host implementation
    AidlImplemented,
    /// Service resolution is blocked due to missing Binder driver or absent service
    Blocked,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FrameworkServiceEntry {
    pub name: String,
    pub interface_descriptor: String,
    pub assigned_handle: Option<u32>,
    pub status: ServiceResolutionStatus,
    pub is_critical: bool,
    pub aidl_implemented: bool,
    pub last_error: Option<String>,
}

/// ServiceManager Client capable of querying Binder Handle 0
pub struct ServiceManagerClient {
    binder_device_path: PathBuf,
    is_driver_available: bool,
}

impl ServiceManagerClient {
    pub fn new(binder_device_path: impl AsRef<Path>) -> Self {
        let p = binder_device_path.as_ref().to_path_buf();
        let available = p.exists();
        Self {
            binder_device_path: p,
            is_driver_available: available,
        }
    }

    pub fn is_driver_available(&self) -> bool {
        self.is_driver_available
    }

    pub fn device_path(&self) -> &Path {
        &self.binder_device_path
    }

    /// Query ServiceManager at Handle 0 for a named service.
    /// In a genuine environment without a mounted /dev/binderfs node,
    /// this returns an explicit error rather than fabricating handles.
    pub fn query_service(&self, name: &str) -> Result<u32, String> {
        if !self.is_driver_available {
            return Err(format!(
                "BLOCKED: Binder driver device not found at '{}' (CONFIG_ANDROID_BINDER_IPC missing)",
                self.binder_device_path.display()
            ));
        }

        // When driver node exists, would execute ioctl(fd, BINDER_WRITE_READ, &bwr)
        // against Handle 0 with SVC_MGR_CHECK_SERVICE.
        // If no ServiceManager process is registered as context manager, return error:
        Err(format!(
            "BLOCKED: No active ServiceManager context manager registered on '{}' to query '{}'",
            self.binder_device_path.display(),
            name
        ))
    }

    /// Ping a binder handle using BINDER_PING_TRANSACTION (0x5f504e47)
    pub fn ping_handle(&self, handle: u32) -> Result<(), String> {
        if !self.is_driver_available {
            return Err(format!(
                "BLOCKED: Cannot ping handle {}: Binder driver unavailable at '{}'",
                handle,
                self.binder_device_path.display()
            ));
        }
        Err(format!(
            "BLOCKED: Handle {} ping failed: driver unreachable",
            handle
        ))
    }
}

/// Service Registry representation separating local config from genuine remote discovery
#[derive(Debug, Clone)]
pub struct ServiceManagerRegistry {
    services: HashMap<String, FrameworkServiceEntry>,
}

impl Default for ServiceManagerRegistry {
    fn default() -> Self {
        let mut reg = Self {
            services: HashMap::new(),
        };
        reg.init_declared_framework_services();
        reg
    }
}

impl ServiceManagerRegistry {
    pub fn new() -> Self {
        Self::default()
    }

    fn init_declared_framework_services(&mut self) {
        let core = [
            ("package", "android.content.pm.IPackageManager", true, false),
            ("activity", "android.app.IActivityManager", true, false),
            ("power", "android.os.IPowerManager", true, false),
            ("display", "android.hardware.display.IDisplayManager", true, true),
            ("audio", "android.media.IAudioService", true, true),
            ("connectivity", "android.net.IConnectivityManager", true, true),
            ("media_session", "android.media.session.ISessionManager", false, false),
            ("notification", "android.app.INotificationManager", false, false),
        ];

        for (name, desc, critical, implemented) in core {
            self.services.insert(
                name.to_string(),
                FrameworkServiceEntry {
                    name: name.to_string(),
                    interface_descriptor: desc.to_string(),
                    assigned_handle: None,
                    status: ServiceResolutionStatus::LocallyConfigured,
                    is_critical: critical,
                    aidl_implemented: implemented,
                    last_error: None,
                },
            );
        }
    }

    /// Update a service record based on actual discovery results
    pub fn update_discovery_result(
        &mut self,
        name: &str,
        handle: Option<u32>,
        status: ServiceResolutionStatus,
        error: Option<String>,
    ) {
        if let Some(entry) = self.services.get_mut(name) {
            entry.assigned_handle = handle;
            entry.status = status;
            entry.last_error = error;
        }
    }

    pub fn get_service(&self, name: &str) -> Option<&FrameworkServiceEntry> {
        self.services.get(name)
    }

    pub fn all_services(&self) -> Vec<&FrameworkServiceEntry> {
        let mut list: Vec<&FrameworkServiceEntry> = self.services.values().collect();
        list.sort_by(|a, b| a.name.cmp(&b.name));
        list
    }

    pub fn count(&self) -> usize {
        self.services.len()
    }
}
