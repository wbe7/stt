use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

#[derive(Debug, Serialize, Deserialize)]
pub struct HotkeyEvent {
    pub hotkey: String,
    pub state: String, // "pressed" or "released"
}

pub struct HotkeyState {
    pub hotkeys: Vec<String>,
}

#[tauri::command]
pub async fn register_hotkey(app_handle: AppHandle, hotkey: String) -> Result<(), String> {
    let shortcut = parse_hotkey(&hotkey)
        .map_err(|e| format!("Failed to parse hotkey: {}", e))?;

    app_handle
        .global_shortcut()
        .register(shortcut)
        .map_err(|e| format!("Failed to register hotkey: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn unregister_hotkey(app_handle: AppHandle, hotkey: String) -> Result<(), String> {
    let shortcut = parse_hotkey(&hotkey)
        .map_err(|e| format!("Failed to parse hotkey: {}", e))?;

    app_handle
        .global_shortcut()
        .unregister(shortcut)
        .map_err(|e| format!("Failed to unregister hotkey: {}", e))?;

    Ok(())
}

fn parse_hotkey(hotkey: &str) -> Result<Shortcut, String> {
    let parts: Vec<&str> = hotkey.split('+').collect();

    if parts.is_empty() {
        return Err("Empty hotkey".to_string());
    }

    let key = parts.last().ok_or("No key specified")?;

    let modifiers = parts.iter().take(parts.len() - 1);

    let mut shortcut_modifiers = tauri_plugin_global_shortcut::Modifiers::empty();

    for modifier in modifiers {
        match modifier.to_lowercase().as_str() {
            "command" | "cmd" | "meta" => {
                shortcut_modifiers |= tauri_plugin_global_shortcut::Modifiers::SUPER;
            }
            "control" | "ctrl" => {
                shortcut_modifiers |= tauri_plugin_global_shortcut::Modifiers::CONTROL;
            }
            "option" | "alt" | "opt" => {
                shortcut_modifiers |= tauri_plugin_global_shortcut::Modifiers::ALT;
            }
            "shift" => {
                shortcut_modifiers |= tauri_plugin_global_shortcut::Modifiers::SHIFT;
            }
            _ => return Err(format!("Unknown modifier: {}", modifier)),
        }
    }

    let code = parse_key_code(key)?;

    Ok(Shortcut::new(
        if shortcut_modifiers.is_empty() {
            None
        } else {
            Some(shortcut_modifiers)
        },
        code,
    ))
}

fn parse_key_code(key: &str) -> Result<tauri_plugin_global_shortcut::Code, String> {
    match key.to_lowercase().as_str() {
        "v" => Ok(tauri_plugin_global_shortcut::Code::KeyV),
        " " | "space" => Ok(tauri_plugin_global_shortcut::Code::Space),
        "return" | "enter" => Ok(tauri_plugin_global_shortcut::Code::Enter),
        "escape" | "esc" => Ok(tauri_plugin_global_shortcut::Code::Escape),
        _ => Err(format!("Unsupported key: {}", key)),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_hotkey() {
        let result = parse_hotkey("Command+V");
        assert!(result.is_ok());
    }

    #[test]
    fn test_parse_complex_hotkey() {
        let result = parse_hotkey("CommandOrControl+Shift+V");
        assert!(result.is_ok());
    }

    #[test]
    fn test_parse_invalid_hotkey() {
        let result = parse_hotkey("");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_invalid_modifier() {
        let result = parse_hotkey("Invalid+V");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_space_key() {
        let result = parse_hotkey("Command+Space");
        assert!(result.is_ok());
    }

    #[test]
    fn test_parse_enter_key() {
        let result = parse_hotkey("Command+Enter");
        assert!(result.is_ok());
    }
}
