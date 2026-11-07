//! Android System Properties Store
//! Backs android.os.SystemProperties and Bionic __system_property_get

use lotify_errors::{LotifyError, Result};
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufRead, BufReader};
use std::path::Path;

#[derive(Debug, Clone)]
pub struct SystemPropertiesStore {
    properties: HashMap<String, String>,
}

impl Default for SystemPropertiesStore {
    fn default() -> Self {
        let mut store = Self {
            properties: HashMap::new(),
        };
        store.set_defaults();
        store
    }
}

impl SystemPropertiesStore {
    pub fn new() -> Self {
        Self::default()
    }

    fn set_defaults(&mut self) {
        self.set("ro.build.version.release", "14");
        self.set("ro.build.version.sdk", "34");
        self.set("ro.build.version.codename", "REL");
        self.set("ro.product.model", "Lotify Compatibility Device");
        self.set("ro.product.brand", "Lotify");
        self.set("ro.product.name", "aosp_x86_64_lotify");
        self.set("ro.product.cpu.abi", "x86_64");
        self.set("dalvik.vm.heapsize", "768m");
        self.set("dalvik.vm.execution-mode", "int:jit");
        self.set("ro.lotify.version", "0.3.0");
        self.set("ro.lotify.aosp_revision", "android-14.0.0_r50");
    }

    pub fn load_from_file<P: AsRef<Path>>(&mut self, path: P) -> Result<usize> {
        let p = path.as_ref();
        if !p.exists() {
            return Ok(self.properties.len());
        }

        let file = File::open(p)
            .map_err(|e| LotifyError::Config(format!("Failed to open build.prop at {}: {}", p.display(), e)))?;
        let reader = BufReader::new(file);

        let mut loaded = 0;
        for line_res in reader.lines() {
            let line = line_res.map_err(|e| LotifyError::Config(format!("Read error: {}", e)))?;
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with('#') {
                continue;
            }
            if let Some((k, v)) = trimmed.split_once('=') {
                self.properties.insert(k.trim().to_string(), v.trim().to_string());
                loaded += 1;
            }
        }

        Ok(loaded)
    }

    pub fn get(&self, key: &str) -> Option<&str> {
        self.properties.get(key).map(|s| s.as_str())
    }

    pub fn get_or_default<'a>(&'a self, key: &str, default: &'a str) -> &'a str {
        self.get(key).unwrap_or(default)
    }

    pub fn set<K: Into<String>, V: Into<String>>(&mut self, key: K, value: V) {
        self.properties.insert(key.into(), value.into());
    }

    pub fn all_properties(&self) -> &HashMap<String, String> {
        &self.properties
    }
}
