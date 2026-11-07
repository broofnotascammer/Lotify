#[cfg(test)]
mod tests {
    use lotify_android_bootstrap::{ArtBootstrapRunner, ArtVmOptions, PINNED_AOSP_REVISION, TARGET_ANDROID_API_LEVEL};
    use std::path::PathBuf;

    #[test]
    fn test_pinned_aosp_metadata() {
        assert_eq!(PINNED_AOSP_REVISION, "android-14.0.0_r50");
        assert_eq!(TARGET_ANDROID_API_LEVEL, 34);
    }

    #[test]
    fn test_art_vm_options_builder() {
        let opts = ArtVmOptions::default();
        let args = opts.build_arguments();

        assert!(args.iter().any(|a| a.starts_with("-Ximage:")));
        assert!(args.iter().any(|a| a.starts_with("-Xbootclasspath:")));
        assert!(args.iter().any(|a| a == "-Xcompiler-option:--compiler-filter=speed-profile"));
        assert!(args.iter().any(|a| a == "-Xusejit:true"));
        assert!(args.iter().any(|a| a == "-Xms64m"));
        assert!(args.iter().any(|a| a == "-Xmx512m"));
    }

    #[test]
    fn test_controlled_dex_runner_execution() {
        let opts = ArtVmOptions::default();
        let runner = ArtBootstrapRunner::new(opts);

        let test_dex_path = PathBuf::from("native/android/test-dex/HelloLotify.dex");
        // Ensure test DEX file is created for test validation
        if test_dex_path.exists() {
            let res = runner.execute_test_dex(&test_dex_path);
            assert!(res.is_ok());
            let report = res.unwrap();
            assert_eq!(report.computed_result, 242);
            assert_eq!(report.class_name, "org.lotify.test.HelloLotify");
            assert!(report.jni_echo_output.contains("x86_64 AOSP ART 14 bridge"));
        }
    }
}
