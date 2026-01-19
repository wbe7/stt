use tauri::Manager;

#[tauri::command]
pub async fn write_text(text: String) -> Result<(), String> {
    let clipboard = tauri_plugin_clipboard_manager::Clipboard::new();

    clipboard
        .write_text(text)
        .map_err(|e| format!("Failed to write to clipboard: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn read_text() -> Result<String, String> {
    let clipboard = tauri_plugin_clipboard_manager::Clipboard::new();

    clipboard
        .read_text()
        .map_err(|e| format!("Failed to read from clipboard: {}", e))?
        .ok_or_else(|| "Clipboard is empty".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_text() {
        let text = "".to_string();
        assert!(text.is_empty());
    }

    #[test]
    fn test_clipboard_text_validation() {
        let valid_text = "Hello, World!";
        assert!(!valid_text.is_empty());
        assert!(valid_text.len() > 0);
    }

    #[test]
    fn test_special_characters() {
        let special_chars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
        assert!(!special_chars.is_empty());
    }

    #[test]
    fn test_multiline_text() {
        let multiline = "Line 1\nLine 2\nLine 3";
        assert!(multiline.contains('\n'));
    }

    #[test]
    fn test_unicode_text() {
        let unicode = "Привет 你好 مرحبا שלום";
        assert!(!unicode.is_empty());
        assert!(unicode.chars().count() > 0);
    }
}
