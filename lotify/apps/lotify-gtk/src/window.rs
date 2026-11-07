//! Main Window with Libadwaita ViewSwitcher and Sub-pages

use crate::pages::{DiagnosticsPage, HomePage, RuntimePage, SettingsPage};
use gtk4::prelude::*;
use libadwaita::prelude::*;
use libadwaita::{ApplicationWindow, HeaderBar, ViewStack, ViewSwitcherTitle};

pub struct LotifyWindow;

impl LotifyWindow {
    pub fn new(app: &libadwaita::Application) -> ApplicationWindow {
        let window = ApplicationWindow::builder()
            .application(app)
            .title("Lotify — Android Spotify Platform")
            .default_width(1080)
            .default_height(720)
            .build();

        let header = HeaderBar::new();
        let view_stack = ViewStack::new();
        let view_switcher = ViewSwitcherTitle::new();
        view_switcher.set_stack(Some(&view_stack));
        header.set_title_widget(Some(&view_switcher));

        let home_page = HomePage::new();
        let runtime_page = RuntimePage::new();
        let diagnostics_page = DiagnosticsPage::new();
        let settings_page = SettingsPage::new();

        view_stack.add_titled(&home_page, Some("home"), "Overview");
        view_stack.add_titled(&runtime_page, Some("runtime"), "Supervisor");
        view_stack.add_titled(&diagnostics_page, Some("diagnostics"), "Diagnostics");
        view_stack.add_titled(&settings_page, Some("settings"), "Settings");

        let content_box = gtk4::Box::new(gtk4::Orientation::Vertical, 0);
        content_box.append(&header);
        content_box.append(&view_stack);

        window.set_content(Some(&content_box));
        window
    }
}
