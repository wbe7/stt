use tauri::command;

#[command]
pub async fn enable_autostart() -> Result<(), String> {
    tauri_plugin_autostart::enable()
        .map_err(|e| format!("Failed to enable autostart: {}", e))
}

#[command]
pub async fn disable_autostart() -> Result<(), String> {
    tauri_plugin_autostart::disable()
        .map_err(|e| format!("Failed to disable autostart: {}", e))
}

#[command]
pub async fn is_autostart_enabled() -> Result<bool, String> {
    tauri_plugin_autostart::is_enabled()
        .map_err(|e| format!("Failed to check autostart status: {}", e))
}