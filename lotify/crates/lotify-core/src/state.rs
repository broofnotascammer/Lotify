//! Runtime Supervisor State Machine

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum RuntimeState {
    Stopped,
    Starting,
    Ready,
    Launching,
    Running,
    Stopping,
    Failed,
}

impl Default for RuntimeState {
    fn default() -> Self {
        Self::Stopped
    }
}

#[derive(Debug, Clone)]
pub enum StateEvent {
    StartRequested,
    InitializedSuccess { pid: u32, socket_path: String },
    InitializationFailed { reason: String, code: String },
    LaunchAppRequested { package_name: String, apk_path: String },
    AppStartedSuccess { pid: u32 },
    AppLaunchFailed { reason: String },
    AppExited { exit_code: i32 },
    StopRequested { force: bool },
    StoppedCleanly,
    HeartbeatTimeout,
    Reset,
}

#[derive(Debug, Clone, Default)]
pub struct RuntimeContext {
    pub state: RuntimeState,
    pub daemon_pid: Option<u32>,
    pub app_pid: Option<u32>,
    pub active_package: Option<String>,
    pub socket_path: Option<String>,
    pub last_error: Option<String>,
    pub error_code: Option<String>,
}

impl RuntimeContext {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn apply_event(&mut self, event: StateEvent) {
        match (self.state, event) {
            (RuntimeState::Stopped, StateEvent::StartRequested) => {
                self.state = RuntimeState::Starting;
                self.last_error = None;
                self.error_code = None;
            }
            (RuntimeState::Starting, StateEvent::InitializedSuccess { pid, socket_path }) => {
                self.state = RuntimeState::Ready;
                self.daemon_pid = Some(pid);
                self.socket_path = Some(socket_path);
            }
            (RuntimeState::Starting, StateEvent::InitializationFailed { reason, code }) => {
                self.state = RuntimeState::Failed;
                self.last_error = Some(reason);
                self.error_code = Some(code);
            }
            (RuntimeState::Ready, StateEvent::LaunchAppRequested { package_name, .. }) => {
                self.state = RuntimeState::Launching;
                self.active_package = Some(package_name);
            }
            (RuntimeState::Ready, StateEvent::StopRequested { .. }) => {
                self.state = RuntimeState::Stopping;
            }
            (RuntimeState::Launching, StateEvent::AppStartedSuccess { pid }) => {
                self.state = RuntimeState::Running;
                self.app_pid = Some(pid);
            }
            (RuntimeState::Launching, StateEvent::AppLaunchFailed { reason }) => {
                self.state = RuntimeState::Ready;
                self.last_error = Some(reason);
                self.active_package = None;
            }
            (RuntimeState::Running, StateEvent::AppExited { .. }) => {
                self.state = RuntimeState::Ready;
                self.app_pid = None;
                self.active_package = None;
            }
            (RuntimeState::Running, StateEvent::StopRequested { .. }) => {
                self.state = RuntimeState::Stopping;
            }
            (RuntimeState::Stopping, StateEvent::StoppedCleanly) => {
                self.state = RuntimeState::Stopped;
                self.daemon_pid = None;
                self.app_pid = None;
                self.active_package = None;
                self.socket_path = None;
            }
            (RuntimeState::Failed, StateEvent::Reset) => {
                self.state = RuntimeState::Stopped;
                self.last_error = None;
                self.error_code = None;
            }
            (_, StateEvent::HeartbeatTimeout) => {
                self.state = RuntimeState::Failed;
                self.last_error = Some("Daemon heartbeat timed out".into());
                self.error_code = Some("ERR_IPC_TIMEOUT".into());
            }
            _ => {
                // Ignore invalid state transition
            }
        }
    }
}
