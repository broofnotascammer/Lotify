//! Application setup and lifecycle for GTK 4 / Libadwaita

use crate::window::LotifyWindow;
use gtk4::prelude::*;
use libadwaita::prelude::*;
use libadwaita::Application;

pub struct LotifyApplication {
    app: Application,
}

impl LotifyApplication {
    pub fn new() -> Self {
        let app = Application::builder()
            .application_id("org.lotify.Lotify")
            .build();

        app.connect_activate(|app| {
            let win = LotifyWindow::new(app);
            win.present();
        });

        Self { app }
    }

    pub fn run(&self) -> glib::ExitCode {
        self.app.run()
    }
}
