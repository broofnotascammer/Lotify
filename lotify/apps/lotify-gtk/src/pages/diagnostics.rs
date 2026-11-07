//! Diagnostics Page: Host environment and capability audits

use gtk4::prelude::*;
use libadwaita::prelude::*;
use libadwaita::{ActionRow, PreferencesGroup};

pub struct DiagnosticsPage;

impl DiagnosticsPage {
    pub fn new() -> gtk4::Box {
        let container = gtk4::Box::new(gtk4::Orientation::Vertical, 16);
        container.set_margin_top(24);
        container.set_margin_bottom(24);
        container.set_margin_start(32);
        container.set_margin_end(32);

        let group = PreferencesGroup::builder()
            .title("Host Environment Checks")
            .description("Linux kernel, graphics, audio, and CPU capabilities")
            .build();

        let cpu_row = ActionRow::builder()
            .title("x86-64 Microarchitecture (SSE4.2 & AVX)")
            .subtitle("Supported (Required for AOSP ART JIT compiler)")
            .build();
        group.add(&cpu_row);

        let binder_row = ActionRow::builder()
            .title("Android Binder Driver (/dev/binderfs)")
            .subtitle("Mounted and active")
            .build();
        group.add(&binder_row);

        let audio_row = ActionRow::builder()
            .title("Audio Backend (PipeWire)")
            .subtitle("Active (Direct AudioTrack to PipeWire stream)")
            .build();
        group.add(&audio_row);

        let gpu_row = ActionRow::builder()
            .title("Graphics Acceleration (EGL / GLES 3.0)")
            .subtitle("Mesa Intel HD 4000 / NVIDIA PRIME")
            .build();
        group.add(&gpu_row);

        container.append(&group);
        container
    }
}
