//! lotify-framework-bridge: Display Manager Bridge
//!
//! Bridges Android `android.hardware.display.IDisplayManager` to Linux display server
//! (X11 / Wayland via GTK / EGL).
//!
//! Target hardware constraints (MacBookPro9,1 / Ivy Bridge Intel HD 4000):
//! - Resolution: 1440x900 default native panel
//! - Density: 220 dpi (reported to Android as xhdpi, 320 densityDpi scaled)
//! - GPU silicon limitation: Intel Gen7 (Ivy Bridge) does NOT support ASTC texture decompression in hardware.
//!   Software ASTC decompression is enabled for compressed textures.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayDeviceInfo {
    pub display_id: u32,
    pub name: String,
    pub width: u32,
    pub height: u32,
    pub density_dpi: u32,
    pub refresh_rate: f32,
    pub rotation: u32,
    pub astc_hardware_supported: bool,
    pub astc_software_fallback: bool,
}

pub struct DisplayManagerBridge {
    default_display: DisplayDeviceInfo,
}

impl DisplayManagerBridge {
    pub fn new() -> Self {
        Self {
            default_display: DisplayDeviceInfo {
                display_id: 0,
                name: "Lotify Virtual Display (1440x900 IvyBridge)".to_string(),
                width: 1440,
                height: 900,
                density_dpi: 320, // xhdpi scaling for 220 physical dpi panel
                refresh_rate: 60.0,
                rotation: 0,
                astc_hardware_supported: false, // Ivy Bridge silicon lacks ASTC
                astc_software_fallback: true,
            },
        }
    }

    pub fn get_default_display(&self) -> &DisplayDeviceInfo {
        &self.default_display
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        self.default_display.width = width;
        self.default_display.height = height;
    }
}

impl Default for DisplayManagerBridge {
    fn default() -> Self {
        Self::new()
    }
}
