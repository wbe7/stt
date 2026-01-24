use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
use crate::state_machine::{StateMachine, RecordingMode, Event, Action};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HotkeyEvent {
    pub hotkey: String,
    pub state: String, // "pressed" or "released"
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecordingInfo {
    pub is_recording: bool,
    pub mode: String, // "hold" or "toggle"
    pub start_time: Option<u64>,
    pub action: String, // "start" | "commit" | "cancel"
}


#[derive(Debug)]
pub struct HotkeyState {
    pub recording_state: Mutex<StateMachine>,
}

impl HotkeyState {
    pub fn new() -> Self {
        HotkeyState::default()
    }
}

impl Default for HotkeyState {
    fn default() -> Self {
        HotkeyState {
            recording_state: Mutex::new(StateMachine::new()),
        }
    }
}

#[tauri::command]
pub async fn register_hotkey(
    app_handle: AppHandle,
    state: State<'_, HotkeyState>,
    hotkey: String,
) -> Result<(), String> {
    let shortcut = parse_hotkey(&hotkey)
        .map_err(|e| format!("Failed to parse hotkey: {}", e))?;

    let hotkey_clone = hotkey.clone();
    let app_handle_clone = app_handle.clone();

    app_handle
        .global_shortcut()
        .on_shortcut(shortcut, move |app, _shortcut, event| {
            let state_str = if event.state == ShortcutState::Pressed {
                "pressed"
            } else {
                "released"
            };

            let hotkey_event = HotkeyEvent {
                hotkey: hotkey_clone.clone(),
                state: state_str.to_string(),
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64,
            };

            app.emit("hotkey-event", hotkey_event)
                .unwrap_or_else(|e| eprintln!("Failed to emit hotkey event: {}", e));
        })
        .map_err(|e| format!("Failed to register hotkey handler: {}", e))?;

    app_handle
        .global_shortcut()
        .register(shortcut)
        .map_err(|e| format!("Failed to register hotkey: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn register_toggle_hotkey(
    app_handle: AppHandle,
    state: State<'_, HotkeyState>,
    hotkey: String,
) -> Result<(), String> {
    let shortcut = parse_hotkey(&hotkey)
        .map_err(|e| format!("Failed to parse hotkey: {}", e))?;

    let hotkey_clone = hotkey.clone();
    let app_handle_clone = app_handle.clone();

    app_handle
        .global_shortcut()
        .on_shortcut(shortcut, move |app, _shortcut, event| {
            let state_str = if event.state == ShortcutState::Pressed {
                "pressed"
            } else {
                "released"
            };

            if event.state == ShortcutState::Pressed {
                let mut sm = app.state::<HotkeyState>().recording_state.lock().unwrap();
                sm.set_mode(RecordingMode::Toggle);
                let timestamp = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64;
                let action = sm.transition(Event::Press, timestamp);

                if action != Action::None {
                    let recording_info = RecordingInfo {
                        is_recording: sm.is_recording,
                        mode: sm.mode.as_str().to_string(),
                        start_time: sm.start_time,
                        action: match action {
                            Action::Start => "start".to_string(),
                            Action::Commit => "commit".to_string(),
                            Action::Cancel => "cancel".to_string(),
                            Action::None => "".to_string(),
                        },
                    };

                    app.emit("recording-state-changed", recording_info)
                        .unwrap_or_else(|e| eprintln!("Failed to emit recording state: {}", e));
                }
            }

            let hotkey_event = HotkeyEvent {
                hotkey: hotkey_clone.clone(),
                state: state_str.to_string(),
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64,
            };

            app.emit("hotkey-event", hotkey_event)
                .unwrap_or_else(|e| eprintln!("Failed to emit hotkey event: {}", e));
        })
        .map_err(|e| format!("Failed to register hotkey handler: {}", e))?;

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

#[tauri::command]
pub async fn register_record_hotkey(
    app_handle: AppHandle,
    state: State<'_, HotkeyState>,
    hotkey: String,
    mode: String,
) -> Result<(), String> {
    let recording_mode = if mode == "hold" {
        RecordingMode::Hold
    } else if mode == "toggle" {
        RecordingMode::Toggle
    } else {
        return Err(format!("Invalid mode: {}", mode));
    };

    let shortcut = parse_hotkey(&hotkey)
        .map_err(|e| format!("Failed to parse hotkey: {}", e))?;

    let hotkey_clone = hotkey.clone();
    let app_handle_clone = app_handle.clone();

    app_handle
        .global_shortcut()
        .on_shortcut(shortcut, move |app, _shortcut, event| {
            let mut sm = app.state::<HotkeyState>().recording_state.lock().unwrap();
            sm.set_mode(recording_mode.clone());
            let timestamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis() as u64;
            let event_type = if event.state == ShortcutState::Pressed { Event::Press } else { Event::Release };
            let action = sm.transition(event_type, timestamp);

            if action != Action::None {
                let recording_info = RecordingInfo {
                    is_recording: sm.is_recording,
                    mode: sm.mode.as_str().to_string(),
                    start_time: sm.start_time,
                    action: match action {
                        Action::Start => "start".to_string(),
                        Action::Commit => "commit".to_string(),
                        Action::Cancel => "cancel".to_string(),
                        Action::None => "".to_string(),
                    },
                };

                app.emit("recording-state-changed", recording_info)
                    .unwrap_or_else(|e| eprintln!("Failed to emit recording state: {}", e));
            }

            let state_str = if event.state == ShortcutState::Pressed {
                "pressed"
            } else {
                "released"
            };

            let hotkey_event = HotkeyEvent {
                hotkey: hotkey_clone.clone(),
                state: state_str.to_string(),
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64,
            };

            app.emit("hotkey-event", hotkey_event)
                .unwrap_or_else(|e| eprintln!("Failed to emit hotkey event: {}", e));
        })
        .map_err(|e| format!("Failed to register hotkey handler: {}", e))?;

    app_handle
        .global_shortcut()
        .register(shortcut)
        .map_err(|e| format!("Failed to register hotkey: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn register_commit_hotkey(
    app_handle: AppHandle,
    state: State<'_, HotkeyState>,
    hotkey: String,
) -> Result<(), String> {
    let shortcut = parse_hotkey(&hotkey)
        .map_err(|e| format!("Failed to parse hotkey: {}", e))?;

    let hotkey_clone = hotkey.clone();

    app_handle
        .global_shortcut()
        .on_shortcut(shortcut, move |app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                let mut recording_state = app.state::<HotkeyState>().recording_state.lock().unwrap();

                if recording_state.is_recording {
                    recording_state.is_recording = false;
                    recording_state.start_time = None;

                    let recording_info = RecordingInfo {
                        is_recording: recording_state.is_recording,
                        mode: recording_state.mode.as_str().to_string(),
                        start_time: recording_state.start_time,
                        action: "commit".to_string(),
                    };

                    app.emit("recording-state-changed", recording_info)
                        .unwrap_or_else(|e| eprintln!("Failed to emit recording state: {}", e));
                }
            }

            let state_str = if event.state == ShortcutState::Pressed {
                "pressed"
            } else {
                "released"
            };

            let hotkey_event = HotkeyEvent {
                hotkey: hotkey_clone.clone(),
                state: state_str.to_string(),
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64,
            };

            app.emit("hotkey-event", hotkey_event)
                .unwrap_or_else(|e| eprintln!("Failed to emit hotkey event: {}", e));
        })
        .map_err(|e| format!("Failed to register hotkey handler: {}", e))?;

    app_handle
        .global_shortcut()
        .register(shortcut)
        .map_err(|e| format!("Failed to register hotkey: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn register_cancel_hotkey(
    app_handle: AppHandle,
    state: State<'_, HotkeyState>,
    hotkey: String,
) -> Result<(), String> {
    let shortcut = parse_hotkey(&hotkey)
        .map_err(|e| format!("Failed to parse hotkey: {}", e))?;

    let hotkey_clone = hotkey.clone();

    app_handle
        .global_shortcut()
        .on_shortcut(shortcut, move |app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                let mut sm = app.state::<HotkeyState>().recording_state.lock().unwrap();
                let timestamp = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64;
                let action = sm.transition(Event::Cancel, timestamp);

                if action != Action::None {
                    let recording_info = RecordingInfo {
                        is_recording: sm.is_recording,
                        mode: sm.mode.as_str().to_string(),
                        start_time: sm.start_time,
                        action: match action {
                            Action::Start => "start".to_string(),
                            Action::Commit => "commit".to_string(),
                            Action::Cancel => "cancel".to_string(),
                            Action::None => "".to_string(),
                        },
                    };

                    app.emit("recording-state-changed", recording_info)
                        .unwrap_or_else(|e| eprintln!("Failed to emit recording state: {}", e));
                }
            }

            let state_str = if event.state == ShortcutState::Pressed {
                "pressed"
            } else {
                "released"
            };

            let hotkey_event = HotkeyEvent {
                hotkey: hotkey_clone.clone(),
                state: state_str.to_string(),
                timestamp: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_millis() as u64,
            };

            app.emit("hotkey-event", hotkey_event)
                .unwrap_or_else(|e| eprintln!("Failed to emit hotkey event: {}", e));
        })
        .map_err(|e| format!("Failed to register hotkey handler: {}", e))?;

    app_handle
        .global_shortcut()
        .register(shortcut)
        .map_err(|e| format!("Failed to register hotkey: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_recording_state(state: State<'_, HotkeyState>) -> Result<RecordingInfo, String> {
    let sm = state.recording_state.lock().unwrap();

    Ok(RecordingInfo {
        is_recording: sm.is_recording,
        mode: sm.mode.as_str().to_string(),
        start_time: sm.start_time,
        action: "".to_string(), // no action for get
    })
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
        "a" => Ok(tauri_plugin_global_shortcut::Code::KeyA),
        "b" => Ok(tauri_plugin_global_shortcut::Code::KeyB),
        "c" => Ok(tauri_plugin_global_shortcut::Code::KeyC),
        "d" => Ok(tauri_plugin_global_shortcut::Code::KeyD),
        "e" => Ok(tauri_plugin_global_shortcut::Code::KeyE),
        "f" => Ok(tauri_plugin_global_shortcut::Code::KeyF),
        "g" => Ok(tauri_plugin_global_shortcut::Code::KeyG),
        "h" => Ok(tauri_plugin_global_shortcut::Code::KeyH),
        "i" => Ok(tauri_plugin_global_shortcut::Code::KeyI),
        "j" => Ok(tauri_plugin_global_shortcut::Code::KeyJ),
        "k" => Ok(tauri_plugin_global_shortcut::Code::KeyK),
        "l" => Ok(tauri_plugin_global_shortcut::Code::KeyL),
        "m" => Ok(tauri_plugin_global_shortcut::Code::KeyM),
        "n" => Ok(tauri_plugin_global_shortcut::Code::KeyN),
        "o" => Ok(tauri_plugin_global_shortcut::Code::KeyO),
        "p" => Ok(tauri_plugin_global_shortcut::Code::KeyP),
        "q" => Ok(tauri_plugin_global_shortcut::Code::KeyQ),
        "r" => Ok(tauri_plugin_global_shortcut::Code::KeyR),
        "s" => Ok(tauri_plugin_global_shortcut::Code::KeyS),
        "t" => Ok(tauri_plugin_global_shortcut::Code::KeyT),
        "u" => Ok(tauri_plugin_global_shortcut::Code::KeyU),
        "v" => Ok(tauri_plugin_global_shortcut::Code::KeyV),
        "w" => Ok(tauri_plugin_global_shortcut::Code::KeyW),
        "x" => Ok(tauri_plugin_global_shortcut::Code::KeyX),
        "y" => Ok(tauri_plugin_global_shortcut::Code::KeyY),
        "z" => Ok(tauri_plugin_global_shortcut::Code::KeyZ),
        "0" => Ok(tauri_plugin_global_shortcut::Code::Digit0),
        "1" => Ok(tauri_plugin_global_shortcut::Code::Digit1),
        "2" => Ok(tauri_plugin_global_shortcut::Code::Digit2),
        "3" => Ok(tauri_plugin_global_shortcut::Code::Digit3),
        "4" => Ok(tauri_plugin_global_shortcut::Code::Digit4),
        "5" => Ok(tauri_plugin_global_shortcut::Code::Digit5),
        "6" => Ok(tauri_plugin_global_shortcut::Code::Digit6),
        "7" => Ok(tauri_plugin_global_shortcut::Code::Digit7),
        "8" => Ok(tauri_plugin_global_shortcut::Code::Digit8),
        "9" => Ok(tauri_plugin_global_shortcut::Code::Digit9),
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

    #[test]
    fn test_parse_alphabetic_keys() {
        for key in ['a', 'b', 'c', 'x', 'y', 'z'] {
            let result = parse_hotkey(&format!("Command+{}", key.to_uppercase()));
            assert!(result.is_ok(), "Failed to parse key: {}", key);
        }
    }

    #[test]
    fn test_parse_digit_keys() {
        for digit in 0..=9 {
            let result = parse_hotkey(&format!("Command+{}", digit));
            assert!(result.is_ok(), "Failed to parse digit: {}", digit);
        }
    }

    #[test]
    fn test_recording_mode_default() {
        let mode = RecordingMode::default();
        assert_eq!(mode, RecordingMode::Hold);
    }

    #[test]
    fn test_recording_mode_as_str() {
        assert_eq!(RecordingMode::Hold.as_str(), "hold");
        assert_eq!(RecordingMode::Toggle.as_str(), "toggle");
    }

    #[test]
    fn test_recording_state_default() {
        let state = RecordingState::default();
        assert!(!state.is_recording);
        assert_eq!(state.mode, RecordingMode::Hold);
        assert!(state.start_time.is_none());
    }
}
