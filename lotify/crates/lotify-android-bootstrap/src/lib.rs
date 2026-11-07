//! Lotify Android Runtime (ART) Bootstrap & Test Runner
//! Pinned to AOSP android-14.0.0_r50

pub mod options;
pub mod runner;

pub use options::ArtVmOptions;
pub use runner::{ArtBootstrapRunner, DexExecutionReport};

pub const PINNED_AOSP_REVISION: &str = "android-14.0.0_r50";
pub const TARGET_ANDROID_API_LEVEL: u32 = 34;
