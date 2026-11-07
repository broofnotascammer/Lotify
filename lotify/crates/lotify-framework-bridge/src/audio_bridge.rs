//! lotify-framework-bridge: Audio Service Bridge
//!
//! Maps Android 14 `android.media.IAudioService` and AudioTrack requests
//! to native PipeWire Linux audio streams.
//!
//! Important engineering detail:
//! Linux PipeWire graph rates default to 48000 Hz. Android media streams
//! (such as Spotify's 44100 Hz Vorbis/AAC output) require explicit rate negotiation
//! with PipeWire's resampler (libspa / speexresample) rather than misleading claims
//! of bit-perfect hardware passthrough.

use lotify_audio::AudioEngine;
use lotify_errors::LotifyResult;
use lotify_logging::info;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioStreamConfig {
    pub stream_type: String, // STREAM_MUSIC
    pub sample_rate_hz: u32, // typically 44100 from Spotify
    pub channels: u32,       // 2 (Stereo)
    pub format: String,      // ENCODING_PCM_16BIT or ENCODING_PCM_FLOAT
    pub pipewire_graph_rate_hz: u32, // 48000 Hz host graph rate
    pub resampling_active: bool,
}

pub struct AudioServiceBridge {
    pipewire_rate: u32,
    active_stream: Option<AudioStreamConfig>,
}

impl AudioServiceBridge {
    pub fn new() -> Self {
        Self {
            pipewire_rate: 48000,
            active_stream: None,
        }
    }

    /// Negotiate audio output configuration from Android AudioTrack to PipeWire
    pub fn configure_stream(
        &mut self,
        stream_type: &str,
        sample_rate: u32,
        channels: u32,
    ) -> LotifyResult<AudioStreamConfig> {
        let resampling_needed = sample_rate != self.pipewire_rate;

        info!(
            "[AUDIO_BRIDGE] Negotiating audio stream: {} @ {}Hz ({} channels). PipeWire graph: {}Hz. Resampling: {}",
            stream_type, sample_rate, channels, self.pipewire_rate, resampling_needed
        );

        let config = AudioStreamConfig {
            stream_type: stream_type.to_string(),
            sample_rate_hz: sample_rate,
            channels,
            format: "ENCODING_PCM_16BIT".to_string(),
            pipewire_graph_rate_hz: self.pipewire_rate,
            resampling_active: resampling_needed,
        };

        self.active_stream = Some(config.clone());
        Ok(config)
    }

    pub fn get_active_stream(&self) -> Option<&AudioStreamConfig> {
        self.active_stream.as_ref()
    }
}

impl Default for AudioServiceBridge {
    fn default() -> Self {
        Self::new()
    }
}
