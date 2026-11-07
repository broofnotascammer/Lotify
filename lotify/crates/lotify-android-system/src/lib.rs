//! lotify-android-system: Android System Bootstrap & Service Registry
//!
//! Provides the fundamental environment for running Android 14 (API 34) services:
//! - Bionic system properties management (`build.prop` loader and memory store)
//! - Binder ServiceManager registry and handle management
//! - Framework service registration and dispatch
//! - Bootstrap orchestrator for bringing up the Android framework environment

pub mod bootstrap;
pub mod properties;
pub mod servicemanager;

pub use bootstrap::{AndroidSystemBootstrap, SystemBootstrapReport};
pub use properties::SystemPropertiesStore;
pub use servicemanager::{
    FrameworkServiceEntry, ServiceManagerClient, ServiceManagerRegistry, ServiceResolutionStatus,
    BINDER_HANDLE_SERVICE_MANAGER, BINDER_PING_TRANSACTION,
};
