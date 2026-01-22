mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
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
            commands::accessibility::check_permission,
            commands::clipboard::write_text,
            commands::clipboard::read_text,
            commands::permissions::check_permissions,
            commands::menubar::create_tray,
            commands::menubar::update_tray_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
