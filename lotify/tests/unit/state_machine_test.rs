#[cfg(test)]
mod tests {
    use lotify_core::{RuntimeContext, RuntimeState, StateEvent};

    #[test]
    fn test_initial_state() {
        let ctx = RuntimeContext::new();
        assert_eq!(ctx.state, RuntimeState::Stopped);
    }

    #[test]
    fn test_lifecycle_transitions() {
        let mut ctx = RuntimeContext::new();
        ctx.apply_event(StateEvent::StartRequested);
        assert_eq!(ctx.state, RuntimeState::Starting);

        ctx.apply_event(StateEvent::InitializedSuccess {
            pid: 1234,
            socket_path: "/run/user/1000/lotify/daemon.sock".into(),
        });
        assert_eq!(ctx.state, RuntimeState::Ready);
        assert_eq!(ctx.daemon_pid, Some(1234));

        ctx.apply_event(StateEvent::LaunchAppRequested {
            package_name: "com.spotify.music".into(),
            apk_path: "/tmp/spotify.apk".into(),
        });
        assert_eq!(ctx.state, RuntimeState::Launching);

        ctx.apply_event(StateEvent::AppStartedSuccess { pid: 5678 });
        assert_eq!(ctx.state, RuntimeState::Running);
        assert_eq!(ctx.app_pid, Some(5678));

        ctx.apply_event(StateEvent::AppExited { exit_code: 0 });
        assert_eq!(ctx.state, RuntimeState::Ready);
        assert_eq!(ctx.app_pid, None);

        ctx.apply_event(StateEvent::StopRequested { force: false });
        assert_eq!(ctx.state, RuntimeState::Stopping);

        ctx.apply_event(StateEvent::StoppedCleanly);
        assert_eq!(ctx.state, RuntimeState::Stopped);
    }
}
