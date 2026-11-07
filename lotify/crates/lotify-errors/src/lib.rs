//! Error definitions for the Lotify compatibility platform.

use thiserror::Error;

#[derive(Error, Debug)]
pub enum LotifyError {
    #[error("Configuration error: {0}")]
    Config(String),

    #[error("IPC protocol error: {0}")]
    Ipc(String),

    #[error("APK parsing error: {0}")]
    Apk(String),

    #[error("Android ABI incompatibility: package does not support x86_64")]
    IncompatibleAbi,

    #[error("Kernel Binder IPC node not found at {0}")]
    BinderUnavailable(String),

    #[error("Android Runtime (ART) bootstrap failed: {0}")]
    ArtBootstrap(String),

    #[error("AudioTrack PipeWire stream creation failed: {0}")]
    AudioBridge(String),

    #[error("EGL context creation failed: {0}")]
    Graphics(String),

    #[error("Process supervisor error: {0}")]
    Supervisor(String),

    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),

    #[error("OS system call error: {0}")]
    Nix(#[from] nix::Error),
}

pub type Result<T> = std::result::Result<T, LotifyError>;
