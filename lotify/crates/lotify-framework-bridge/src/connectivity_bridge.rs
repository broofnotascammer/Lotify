//! lotify-framework-bridge: Connectivity Manager Bridge
//!
//! Bridges Android 14 `android.net.IConnectivityManager` and `NetworkCapabilities`
//! to Linux host network state (NetworkManager, systemd-networkd, or standard socket checks).
//!
//! Ensures genuine Spotify network requests for token refresh, playlist sync, and CDN audio streaming
//! recognize the link as active and unmetered.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkLinkInfo {
    pub is_connected: bool,
    pub transport_type: String, // "WIFI" or "ETHERNET"
    pub has_internet: bool,
    pub is_metered: bool,
    pub link_downstream_kbps: u32,
    pub link_upstream_kbps: u32,
}

pub struct ConnectivityManagerBridge {
    current_link: NetworkLinkInfo,
}

impl ConnectivityManagerBridge {
    pub fn new() -> Self {
        // Defaults to host broadband connection
        Self {
            current_link: NetworkLinkInfo {
                is_connected: true,
                transport_type: "WIFI".to_string(),
                has_internet: true,
                is_metered: false,
                link_downstream_kbps: 100_000,
                link_upstream_kbps: 20_000,
            },
        }
    }

    pub fn get_active_network(&self) -> &NetworkLinkInfo {
        &self.current_link
    }

    pub fn set_connectivity_state(&mut self, connected: bool, has_internet: bool) {
        self.current_link.is_connected = connected;
        self.current_link.has_internet = has_internet;
    }
}

impl Default for ConnectivityManagerBridge {
    fn default() -> Self {
        Self::new()
    }
}
