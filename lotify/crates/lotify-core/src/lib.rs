//! Core library for Lotify runtime management and state abstractions.

pub mod benchmark;
pub mod hardware;
pub mod state;

pub use benchmark::{BenchmarkValue, PerformanceBenchmarker, ProcessMemorySample, RuntimeBenchState, StateBenchmarkReport, SystemBenchmarkSuite};
pub use hardware::{AudioCapabilities, CpuCapabilities, GpuCapabilities, HardwareDetector, HardwareProfile, KernelCapabilities, MemoryProfile};
pub use state::{RuntimeContext, RuntimeState, StateEvent};

pub const LOTIFY_VERSION: &str = env!("CARGO_PKG_VERSION");
pub const DEFAULT_APP_ID: &str = "com.spotify.music";
pub const DEFAULT_SOCKET_NAME: &str = "lotify/daemon.sock";
