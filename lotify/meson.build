project(
  'lotify',
  ['c', 'cpp', 'rust'],
  version: '0.1.0',
  meson_version: '>= 1.2.0',
  default_options: [
    'warning_level=2',
    'werror=false',
    'cpp_std=c++20',
    'c_std=c17',
    'rust_std=2021',
    'buildtype=debugoptimized',
  ],
)

i18n = import('i18n')
gnome = import('gnome')

prefix = get_option('prefix')
bindir = prefix / get_option('bindir')
datadir = prefix / get_option('datadir')
libdir = prefix / get_option('libdir')
sysconfdir = prefix / get_option('sysconfdir')

# Target Linux dependencies
gtk_dep = dependency('gtk4', version: '>= 4.14')
adwaita_dep = dependency('libadwaita-1', version: '>= 1.5')
pipewire_dep = dependency('libpipewire-0.3', version: '>= 1.0')
egl_dep = dependency('egl')
glesv2_dep = dependency('glesv2')
dbus_dep = dependency('dbus-1')
threads_dep = dependency('threads')

# Configure paths and systemd service
subdir('packaging/systemd')
subdir('packaging/desktop')
