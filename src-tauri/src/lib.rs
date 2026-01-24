mod commands;
mod state_machine;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_autostart::init())
        .manage(commands::hotkey::HotkeyState::default())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            if let Ok(monitor) = window.primary_monitor() {
                if let Some(monitor) = monitor {
                    let size = monitor.size();
                    let window_size = tauri::LogicalSize::new(400.0, 60.0);
                    let x = ((size.width as f64 - window_size.width) / 2.0) as i32;
                    let y = (size.height as f64 - window_size.height - 80.0) as i32; // Assume 80px for dock/menu bar
                    let _ = window.set_position(tauri::LogicalPosition::new(x, y));
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::hotkey::register_hotkey,
            commands::hotkey::register_toggle_hotkey,
            commands::hotkey::register_record_hotkey,
            commands::hotkey::register_commit_hotkey,
            commands::hotkey::register_cancel_hotkey,
            commands::hotkey::unregister_hotkey,
            commands::hotkey::get_recording_state,
            commands::accessibility::get_focused_app,
            commands::accessibility::inject_text,
            commands::accessibility::queue_inject_text,
            commands::accessibility::request_permission,
            commands::accessibility::check_permission,
            commands::clipboard::write_text,
            commands::clipboard::read_text,
            commands::permissions::check_permissions,
            commands::permissions::open_privacy_settings,
            commands::menubar::create_tray,
            commands::menubar::update_tray_status,
            commands::autostart::enable_autostart,
            commands::autostart::disable_autostart,
            commands::autostart::is_autostart_enabled,
            commands::logger::log_error,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
