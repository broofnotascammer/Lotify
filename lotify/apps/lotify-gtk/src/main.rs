//! Lotify GTK 4 Desktop Application

mod application;
mod pages;
mod widgets;
mod window;

use application::LotifyApplication;
use gtk4::prelude::*;

fn main() -> glib::ExitCode {
    let app = LotifyApplication::new();
    app.run()
}
