//! Lotify Daemon Implementation
//! Supervises the isolated Android runtime child process and handles GTK client IPC

use lotify_android_runtime::{AndroidProcessConfig, AndroidRuntimeProcess};
use lotify_core::{RuntimeContext, RuntimeState, StateEvent};
use lotify_errors::Result;
use std::path::PathBuf;
use std::sync::Arc;
use tokio::net::UnixListener;
use tokio::sync::Mutex;
use tracing::{error, info, warn};

pub struct Daemon {
    context: Arc<Mutex<RuntimeContext>>,
    socket_path: String,
    android_process: Arc<Mutex<Option<AndroidRuntimeProcess>>>,
}

impl Daemon {
    pub fn new(socket_path: String) -> Self {
        Self {
            context: Arc::new(Mutex::new(RuntimeContext::new())),
            socket_path,
            android_process: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn run(&self) -> Result<()> {
        info!("Initializing Lotify supervisor daemon at {}", self.socket_path);

        // Remove old stale socket if it exists
        if std::path::Path::new(&self.socket_path).exists() {
            let _ = std::fs::remove_file(&self.socket_path);
        }

        if let Some(parent) = std::path::Path::new(&self.socket_path).parent() {
            std::fs::create_dir_all(parent)?;
        }

        let listener = UnixListener::bind(&self.socket_path)?;
        info!("Lotify supervisor listening on Unix domain socket: {}", self.socket_path);

        {
            let mut ctx = self.context.lock().await;
            ctx.apply_event(StateEvent::InitializedSuccess {
                pid: std::process::id(),
                socket_path: self.socket_path.clone(),
            });
        }

        loop {
            match listener.accept().await {
                Ok((_stream, _addr)) => {
                    info!("Accepted incoming client connection from GTK launcher");
                }
                Err(err) => {
                    error!("Error accepting socket connection: {}", err);
                }
            }
        }
    }

    /// Spawns the dedicated Android runtime process in separate Linux namespaces
    pub async fn launch_android_runtime(&self, apk_path: PathBuf) -> Result<u32> {
        info!("Launching isolated Android Runtime process for {}", apk_path.display());
        let mut proc = AndroidRuntimeProcess::new(AndroidProcessConfig::default());
        let pid = proc.spawn(&apk_path)?;

        let mut lock = self.android_process.lock().await;
        *lock = Some(proc);

        let mut ctx = self.context.lock().await;
        ctx.apply_event(StateEvent::AppStartedSuccess { pid });

        Ok(pid)
    }

    pub async fn terminate_android_runtime(&self) -> Result<()> {
        let mut lock = self.android_process.lock().await;
        if let Some(mut proc) = lock.take() {
            proc.terminate()?;
        }
        let mut ctx = self.context.lock().await;
        ctx.apply_event(StateEvent::AppExited { exit_code: 0 });
        Ok(())
    }
}
