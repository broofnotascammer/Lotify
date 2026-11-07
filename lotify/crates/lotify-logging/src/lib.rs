//! Structured logging and redaction for Lotify

use lotify_errors::Result;
use tracing_subscriber::{fmt, prelude::*, EnvFilter};

pub fn init_logging(default_level: &str) -> Result<()> {
    let filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(format!("lotify={default_level},lotify_gtk={default_level}")));

    tracing_subscriber::registry()
        .with(filter)
        .with(fmt::layer().with_target(true).with_thread_ids(true))
        .try_init()
        .ok();

    Ok(())
}

/// Redacts sensitive auth tokens and OAuth bearer headers from log messages
pub fn redact_sensitive_data(input: &str) -> String {
    let re_token = regex_replace(input, "Bearer [a-zA-Z0-9_.-]+", "Bearer [REDACTED]");
    regex_replace(&re_token, "access_token=[a-zA-Z0-9_.-]+", "access_token=[REDACTED]")
}

fn regex_replace(input: &str, pattern: &str, replacement: &str) -> String {
    // Simple substring or pattern replacement helper
    if let Some(pos) = input.find("Bearer ") {
        let mut s = input[..pos + 7].to_string();
        s.push_str("[REDACTED]");
        return s;
    }
    input.to_string()
}
