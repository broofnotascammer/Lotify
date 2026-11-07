//! lotify-framework-bridge: Host Integration for Android Framework Services
//!
//! Provides the concrete bridges connecting AOSP AIDL service stubs to Linux host subsystems:
//! - Audio: `IAudioService` -> PipeWire audio stream negotiation
//! - Display: `IDisplayManager` -> X11/Wayland 1440x900 virtual display with ASTC CPU fallback
//! - Connectivity: `IConnectivityManager` -> Host network state validation

pub mod audio_bridge;
pub mod connectivity_bridge;
pub mod display_bridge;

pub use audio_bridge::{AudioServiceBridge, AudioStreamConfig};
pub use connectivity_bridge::{ConnectivityManagerBridge, NetworkLinkInfo};
pub use display_bridge::{DisplayDeviceInfo, DisplayManagerBridge};
