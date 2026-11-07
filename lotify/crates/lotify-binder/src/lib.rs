//! Android Binder IPC Driver Prober and Feasibility Engine
//! Section 3.3: Kernel Binder Verification and IPC initialization

use lotify_errors::{LotifyError, Result};
use std::fs::File;
use std::path::{Path, PathBuf};
use tracing::{info, warn};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BinderFeasibilityReport {
    pub kernel_binder_supported: bool,
    pub binderfs_mounted: bool,
    pub primary_device_path: Option<String>,
    pub secondary_nodes: Vec<String>,
    pub has_read_write_permissions: bool,
    pub service_manager_status: String,
    pub limitations: Vec<String>,
}

pub struct BinderProber;

impl BinderProber {
    pub fn probe() -> BinderFeasibilityReport {
        let mut report = BinderFeasibilityReport {
            kernel_binder_supported: false,
            binderfs_mounted: false,
            primary_device_path: None,
            secondary_nodes: Vec::new(),
            has_read_write_permissions: false,
            service_manager_status: "Uninitialized".to_string(),
            limitations: Vec::new(),
        };

        let candidate_paths = [
            "/dev/binderfs/binder",
            "/dev/binder",
            "/dev/binderfs/hwbinder",
            "/dev/binderfs/vndbinder",
        ];

        for path in &candidate_paths {
            if Path::new(path).exists() {
                report.kernel_binder_supported = true;
                if path.contains("binderfs") {
                    report.binderfs_mounted = true;
                }
                if report.primary_device_path.is_none() && path.ends_with("binder") {
                    report.primary_device_path = Some(path.to_string());
                    // Check file permissions
                    if let Ok(file) = File::options().read(true).write(true).open(path) {
                        report.has_read_write_permissions = true;
                    }
                } else {
                    report.secondary_nodes.push(path.to_string());
                }
            }
        }

        if !report.kernel_binder_supported {
            report.limitations.push(
                "Kernel Binder driver is missing from host kernel (CONFIG_ANDROID_BINDER_IPC=n).".to_string()
            );
            report.limitations.push(
                "AOSP AIDL services cannot use hardware IPC without /dev/binderfs.".to_string()
            );
        } else if !report.has_read_write_permissions {
            report.limitations.push(
                "Binder node exists but current user lacks rw permissions (requires group 'video' or udev rule).".to_string()
            );
        } else {
            report.service_manager_status = "Available for AOSP ServiceManager spawn".to_string();
        }

        report
    }
}
