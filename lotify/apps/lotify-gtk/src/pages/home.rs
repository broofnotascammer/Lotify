//! Overview / Home Page: Spotify Card & Quick Launch Controls

use gtk4::prelude::*;
use libadwaita::prelude::*;
use libadwaita::{ActionRow, PreferencesGroup, StatusPage};

pub struct HomePage;

impl HomePage {
    pub fn new() -> gtk4::Box {
        let container = gtk4::Box::new(gtk4::Orientation::Vertical, 18);
        container.set_margin_top(24);
        container.set_margin_bottom(24);
        container.set_margin_start(32);
        container.set_margin_end(32);

        let status = StatusPage::builder()
            .icon_name("media-playback-start-symbolic")
            .title("Spotify (Android x86-64)")
            .description("Official Android release running via native AOSP ART compatibility environment")
            .build();
        container.append(&status);

        let group = PreferencesGroup::builder()
            .title("Installed Application")
            .description("Managed Spotify Android instance")
            .build();

        let app_row = ActionRow::builder()
            .title("com.spotify.music")
            .subtitle("Version 8.9.74 (Target SDK 34, Min SDK 24, x86_64 Native)")
            .build();

        let launch_btn = gtk4::Button::builder()
            .label("Launch Application")
            .css_classes(["suggested-action"])
            .valign(gtk4::Align::Center)
            .build();
        app_row.add_suffix(&launch_btn);
        group.add(&app_row);

        let status_row = ActionRow::builder()
            .title("Runtime State")
            .subtitle("Stopped (lotifyd daemon idle)")
            .build();
        group.add(&status_row);

        container.append(&group);
        container
    }
}
