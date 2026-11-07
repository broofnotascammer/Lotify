use lotify_logging::init_logging;
use lotify_supervisor::Daemon;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    init_logging("info")?;
    info!("Starting lotifyd (Lotify Runtime Supervisor Daemon v0.1.0)");

    let socket_path = std::env::var("LOTIFY_SOCKET")
        .unwrap_or_else(|_| "/run/user/1000/lotify/daemon.sock".to_string());

    let daemon = Daemon::new(socket_path);
    daemon.run().await?;

    Ok(())
}
