//! Supervisor & Daemon Runtime Control Page

use gtk4::prelude::*;
use libadwaita::prelude::*;
use libadwaita::{ActionRow, PreferencesGroup};

pub struct RuntimePage;

impl RuntimePage {
    pub fn new() -> gtk4::Box {
        let container = gtk4::Box::new(gtk4::Orientation::Vertical, 16);
        container.set_margin_top(24);
        container.set_margin_bottom(24);
        container.set_margin_start(32);
        container.set_margin_end(32);

        let group = PreferencesGroup::builder()
            .title("Lotify Daemon (lotifyd)")
            .description("Background process managing ART runtime, namespaces, and IPC")
            .build();

        let socket_row = ActionRow::builder()
            .title("Unix Domain Socket")
            .subtitle("/run/user/1000/lotify/daemon.sock")
            .build();
        group.add(&socket_row);

        let ctl_row = ActionRow::builder()
            .title("Daemon Lifecycle")
            .subtitle("Control background supervisor daemon")
            .build();

        let start_btn = gtk4::Button::builder()
            .label("Start Daemon")
            .css_classes(["suggested-action"])
            .valign(gtk4::Align::Center)
            .build();

        let stop_btn = gtk4::Button::builder()
            .label("Stop")
            .css_classes(["destructive-action"])
            .valign(gtk4::Align::Center)
            .build();

        ctl_row.add_suffix(&start_btn);
        ctl_row.add_suffix(&stop_btn);
        group.add(&ctl_row);

        container.append(&group);
        container
    }
}
