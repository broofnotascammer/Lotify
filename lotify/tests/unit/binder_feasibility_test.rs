#[cfg(test)]
mod tests {
    use lotify_binder::BinderProber;

    #[test]
    fn test_binder_prober_evaluation() {
        let report = BinderProber::probe();
        // Verifies probe produces structured report with primary node and limitations
        if !report.kernel_binder_supported {
            assert!(!report.limitations.is_empty());
            assert!(report.limitations.iter().any(|l| l.contains("CONFIG_ANDROID_BINDER_IPC")));
        } else {
            assert!(report.primary_device_path.is_some());
        }
    }
}
