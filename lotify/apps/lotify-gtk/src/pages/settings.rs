//! Settings Page: Hardware and Runtime Configuration

use gtk4::prelude::*;
use libadwaita::prelude::*;
use libadwaita::{ActionRow, PreferencesGroup, SwitchRow};

pub struct SettingsPage;

impl SettingsPage {
    pub fn new() -> gtk4::Box {
        let container = gtk4::Box::new(gtk4::Orientation::Vertical, 16);
        container.set_margin_top(24);
        container.set_margin_bottom(24);
        container.set_margin_start(32);
        container.set_margin_end(32);

        let group = PreferencesGroup::builder()
            .title("Hardware & Integration Settings")
            .build();

        let mpris_row = SwitchRow::builder()
            .title("Enable D-Bus MPRIS v2 Integration")
            .subtitle("Expose player controls and track metadata to desktop and media keys")
            .active(true)
            .build();
        group.add(&mpris_row);

        let art_row = ActionRow::builder()
            .title("AOSP ART Heap Limit")
            .subtitle("512 MB (Optimal for Spotify Android)")
            .build();
        group.add(&art_row);

        let audio_row = ActionRow::builder()
            .title("PipeWire Stream Passthrough")
            .subtitle("Bit-perfect 44.1kHz / 48kHz audio without resampling")
            .build();
        group.add(&audio_row);

        container.append(&group);
        container
    }
}
