use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MenuBarStatus {
    pub status: String, // "idle" or "recording"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrayMenuAction {
    pub id: String,
    pub label: String,
}

#[tauri::command]
pub async fn create_tray(app_handle: AppHandle) -> Result<(), String> {
    let quit_i = MenuItem::with_id(&app_handle, "quit", "Quit", true, None::<&str>)
        .map_err(|e| format!("Failed to create quit menu item: {}", e))?;
    
    let settings_i = MenuItem::with_id(&app_handle, "settings", "Settings", true, None::<&str>)
        .map_err(|e| format!("Failed to create settings menu item: {}", e))?;
    
    let record_i = MenuItem::with_id(&app_handle, "record", "Record", true, None::<&str>)
        .map_err(|e| format!("Failed to create record menu item: {}", e))?;
    
    let menu = Menu::with_items(&app_handle, &[&record_i, &settings_i, &quit_i])
        .map_err(|e| format!("Failed to create menu: {}", e))?;
    
    let app_handle_clone = app_handle.clone();
    
    TrayIconBuilder::new()
        .menu(&menu)
        .menu_on_left_click(true)
        .tooltip("Voice Dictation")
        .on_menu_event(move |app, event| {
            let event_id = event.id.as_ref();
            match event_id {
                "quit" => {
                    let _ = app.exit(0);
                }
                "settings" => {
                    let _ = app.emit("open-settings", ());
                }
                "record" => {
                    let _ = app.emit("trigger-record", ());
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            match event {
                TrayIconEvent::Click {
                    button: tauri::tray::MouseButton::Left,
                    button_state: tauri::tray::MouseButtonState::Up,
                    ..
                } => {
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.unminimize();
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                _ => {}
            }
        })
        .build(&app_handle)
        .map_err(|e| format!("Failed to create tray icon: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn update_tray_status(app_handle: AppHandle, status: String) -> Result<(), String> {
    let tooltip = if status == "recording" {
        "Voice Dictation - Recording..."
    } else {
        "Voice Dictation"
    };
    
    if let Some(tray) = app_handle.tray_by_id("main") {
        tray.set_tooltip(Some(tooltip))
            .map_err(|e| format!("Failed to update tray tooltip: {}", e))?;
    }
    
    app_handle.emit("tray-status-changed", MenuBarStatus { status })
        .map_err(|e| format!("Failed to emit status: {}", e))?;
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_menu_bar_status_serialization() {
        let status = MenuBarStatus {
            status: "recording".to_string(),
        };
        let serialized = serde_json::to_string(&status).unwrap();
        assert!(serialized.contains("recording"));
    }

    #[test]
    fn test_menu_bar_status_deserialization() {
        let json = r#"{"status":"idle"}"#;
        let status: MenuBarStatus = serde_json::from_str(json).unwrap();
        assert_eq!(status.status, "idle");
    }

    #[test]
    fn test_tray_menu_action_serialization() {
        let action = TrayMenuAction {
            id: "quit".to_string(),
            label: "Quit".to_string(),
        };
        let serialized = serde_json::to_string(&action).unwrap();
        assert!(serialized.contains("quit"));
    }

    #[test]
    fn test_tray_menu_action_deserialization() {
        let json = r#"{"id":"record","label":"Record"}"#;
        let action: TrayMenuAction = serde_json::from_str(json).unwrap();
        assert_eq!(action.id, "record");
        assert_eq!(action.label, "Record");
    }
}