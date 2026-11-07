//! Configuration loading and schema validation for Lotify

use lotify_errors::{LotifyError, Result};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneralConfig {
    #[serde(default = "default_log_level")]
    pub log_level: String,
    #[serde(default = "default_socket_path")]
    pub socket_path: String,
    #[serde(default = "default_auto_start")]
    pub auto_start_daemon: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeConfig {
    #[serde(default = "default_art_heap_mb")]
    pub art_heap_limit_mb: u32,
    #[serde(default = "default_binder_device")]
    pub binder_device: String,
    #[serde(default = "default_true")]
    pub use_isolated_namespaces: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphicsConfig {
    #[serde(default = "default_graphics_backend")]
    pub backend: String,
    #[serde(default = "default_gles_version")]
    pub gles_version: String,
    #[serde(default = "default_true")]
    pub vsync: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioConfig {
    #[serde(default = "default_audio_backend")]
    pub backend: String,
    #[serde(default = "default_sample_rate")]
    pub sample_rate: u32,
    #[serde(default = "default_true")]
    pub preserve_sample_rate: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DesktopConfig {
    #[serde(default = "default_true")]
    pub enable_mpris: bool,
    #[serde(default = "default_true")]
    pub enable_media_keys: bool,
    #[serde(default = "default_true")]
    pub enable_notifications: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct LotifyConfig {
    pub general: Option<GeneralConfig>,
    pub runtime: Option<RuntimeConfig>,
    pub graphics: Option<GraphicsConfig>,
    pub audio: Option<AudioConfig>,
    pub desktop: Option<DesktopConfig>,
}

fn default_log_level() -> String { "info".into() }
fn default_socket_path() -> String { "/run/user/1000/lotify/daemon.sock".into() }
fn default_auto_start() -> bool { true }
fn default_art_heap_mb() -> u32 { 512 }
fn default_binder_device() -> String { "/dev/binderfs/binder".into() }
fn default_true() -> bool { true }
fn default_graphics_backend() -> String { "egl_gles".into() }
fn default_gles_version() -> String { "3.0".into() }
fn default_audio_backend() -> String { "pipewire".into() }
fn default_sample_rate() -> u32 { 48000 }

impl LotifyConfig {
    pub fn load_from_file<P: AsRef<Path>>(path: P) -> Result<Self> {
        let content = std::fs::read_to_string(path.as_ref())
            .map_err(|e| LotifyError::Config(format!("Failed to read {}: {}", path.as_ref().display(), e)))?;
        toml::from_str(&content)
            .map_err(|e| LotifyError::Config(format!("Malformed TOML syntax: {}", e)))
    }

    pub fn default_config_path() -> PathBuf {
        let home = std::env::var("XDG_CONFIG_HOME")
            .unwrap_or_else(|_| format!("{}/.config", std::env::var("HOME").unwrap_or_default()));
        PathBuf::from(home).join("lotify/lotify.toml")
    }
}
