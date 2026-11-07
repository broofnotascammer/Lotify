//! ART Runtime VM Arguments and Boot Classpath Builder
//! Pinned to AOSP android-14.0.0_r50 requirements

use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct ArtVmOptions {
    pub boot_image_path: PathBuf,
    pub boot_classpath: Vec<PathBuf>,
    pub heap_initial_mb: u32,
    pub heap_max_mb: u32,
    pub compiler_filter: String,
    pub enable_jit: bool,
    pub enable_profiling: bool,
    pub extra_options: Vec<String>,
}

impl Default for ArtVmOptions {
    fn default() -> Self {
        Self {
            boot_image_path: PathBuf::from("/apex/com.android.art/javalib/boot.art"),
            boot_classpath: vec![
                PathBuf::from("/apex/com.android.art/javalib/core-oj.jar"),
                PathBuf::from("/apex/com.android.art/javalib/core-libart.jar"),
                PathBuf::from("/apex/com.android.art/javalib/okhttp.jar"),
                PathBuf::from("/system/framework/framework.jar"),
            ],
            heap_initial_mb: 64,
            heap_max_mb: 512,
            compiler_filter: "speed-profile".to_string(),
            enable_jit: true,
            enable_profiling: false,
            extra_options: vec![
                "-verbose:gc".to_string(),
                "-XX:SoftRefLRUPolicyMSPerMB=10000".to_string(),
            ],
        }
    }
}

impl ArtVmOptions {
    /// Formats options into Dalvik/ART standard initialization arguments
    pub fn build_arguments(&self) -> Vec<String> {
        let mut args = Vec::new();

        // Boot image
        args.push(format!("-Ximage:{}", self.boot_image_path.display()));

        // Boot classpath colon-separated
        let bcp_str = self
            .boot_classpath
            .iter()
            .map(|p| p.display().to_string())
            .collect::<Vec<_>>()
            .join(":");
        args.push(format!("-Xbootclasspath:{}", bcp_str));

        // Memory limits
        args.push(format!("-Xms{}m", self.heap_initial_mb));
        args.push(format!("-Xmx{}m", self.heap_max_mb));

        // Compiler & JIT options
        args.push(format!("-Xcompiler-option:--compiler-filter={}", self.compiler_filter));
        if self.enable_jit {
            args.push("-Xusejit:true".to_string());
        }

        // Additional options
        args.extend(self.extra_options.clone());

        args
    }
}
