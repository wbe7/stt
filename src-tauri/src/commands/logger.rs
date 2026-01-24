use std::fs;
use std::path::PathBuf;
use tauri::{command, AppHandle};

#[command]
pub async fn log_error(app: AppHandle, message: String, details: Option<String>) -> Result<(), String> {
    let log_dir = app
        .path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data directory")?;

    if !log_dir.exists() {
        fs::create_dir_all(&log_dir).map_err(|e| e.to_string())?;
    }

    let log_file = log_dir.join("error.log");
    let timestamp = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S");
    let log_entry = format!(
        "[{}] ERROR: {}\n{}\n\n",
        timestamp,
        message,
        details.unwrap_or_default()
    );

    fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(log_file)
        .map_err(|e| e.to_string())?
        .write_all(log_entry.as_bytes())
        .map_err(|e| e.to_string())?;

    Ok(())
}