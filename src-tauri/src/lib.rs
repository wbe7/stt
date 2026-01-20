// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(commands::hotkey::HotkeyState::default())
        .invoke_handler(tauri::generate_handler![
            commands::hotkey::register_hotkey,
            commands::hotkey::register_toggle_hotkey,
            commands::hotkey::unregister_hotkey,
            commands::hotkey::get_recording_state,
            commands::accessibility::get_focused_app,
            commands::accessibility::inject_text,
            commands::accessibility::request_permission,
            commands::clipboard::write_text,
            commands::clipboard::read_text,
            commands::permissions::check_permissions,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
