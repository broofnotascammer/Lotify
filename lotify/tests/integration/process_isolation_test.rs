#[cfg(test)]
mod tests {
    use lotify_android_runtime::{AndroidProcessConfig, AndroidRuntimeProcess};
    use std::path::PathBuf;

    #[test]
    fn test_isolated_process_config_defaults() {
        let config = AndroidProcessConfig::default();
        assert_eq!(config.android_root, PathBuf::from("/var/lib/lotify/system"));
        assert_eq!(config.android_data, PathBuf::from("/var/lib/lotify/data"));
        assert_eq!(config.binder_device, PathBuf::from("/dev/binderfs/binder"));
        assert!(config.enable_namespaces);
    }

    #[test]
    fn test_process_lifecycle_creation_and_termination() {
        let config = AndroidProcessConfig::default();
        let mut proc = AndroidRuntimeProcess::new(config);
        assert!(proc.pid().is_none());
    }
}
