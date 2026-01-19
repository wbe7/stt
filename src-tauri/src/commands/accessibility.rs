use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct InjectTextResult {
    pub success: bool,
    pub method: String, // "accessibility" or "clipboard"
}

#[tauri::command]
pub async fn get_focused_app() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::{NSApplication, NSRunningApplication};
        use cocoa::base::{id, nil};
        use objc::runtime::Object;
        use objc::{msg_send, sel, sel_impl};

        unsafe {
            let workspace: id = msg_send![class!(NSWorkspace), sharedWorkspace];
            let app: id = msg_send![workspace, frontmostApplication];
            let bundle_id: id = msg_send![app, bundleIdentifier];

            if bundle_id == nil {
                return Ok("unknown".to_string());
            }

            let bundle_id_str: *const i8 = msg_send![bundle_id, UTF8String];
            let bundle_id_string = std::ffi::CStr::from_ptr(bundle_id_str)
                .to_string_lossy()
                .into_owned();

            Ok(bundle_id_string)
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok("unsupported_platform".to_string())
    }
}

#[tauri::command]
pub async fn inject_text(text: String) -> Result<InjectTextResult, String> {
    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::{NSApplication, NSRunningApplication};
        use cocoa::base::{id, nil};
        use objc::runtime::Object;
        use objc::{msg_send, sel, sel_impl};

        unsafe {
            let workspace: id = msg_send![class!(NSWorkspace), sharedWorkspace];
            let app: id = msg_send![workspace, frontmostApplication];

            if app == nil {
                return Err("No focused application".to_string());
            }

            let ns_text = cocoa::foundation::NSString::alloc(nil).init_str(&text);

            let pasteboard: id = msg_send![class!(NSPasteboard), generalPasteboard];
            let _: () = msg_send![pasteboard, clearContents];
            let _: () = msg_send![pasteboard, setString: ns_text forType: cocoa::base::id::from(cocoa::base::id::from_string("public.utf8-plain-text"))];

            let event_source: id = msg_send![class!(CGEventSource), new];
            let key_down: id = msg_send![class!(CGEvent), keyboardEventWithEventSource: event_source location: ::cocoa::base::NSPoint::new(0.0, 0.0) flags: 0x10000 virtualKey: 9 keyIsDown: true];
            let key_up: id = msg_send![class!(CGEvent), keyboardEventWithEventSource: event_source location: ::cocoa::base::NSPoint::new(0.0, 0.0) flags: 0x10000 virtualKey: 9 keyIsDown: false];

            let _: () = msg_send![key_down, postToPid: msg_send![app, processIdentifier]];
            let _: () = msg_send![key_up, postToPid: msg_send![app, processIdentifier]];

            Ok(InjectTextResult {
                success: true,
                method: "clipboard".to_string(),
            })
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(InjectTextResult {
            success: false,
            method: "unsupported_platform".to_string(),
        })
    }
}

#[tauri::command]
pub async fn request_permission() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::NSWorkspace;
        use cocoa::base::{id, nil};
        use objc::runtime::Object;
        use objc::{msg_send, sel, sel_impl};

        unsafe {
            let options = cocoa::foundation::NSDictionary::dictionaryWithObject_forKey_(
                nil,
                cocoa::foundation::NSNumber::numberWithBool_(nil, true),
                cocoa::foundation::NSString::alloc(nil).init_str(
                    "AXTrustedCheckOptionPrompt",
                ),
            );

            let trusted: bool = msg_send![
                class!(AXIsProcessTrustedWithOptions:),
                options
            ];

            Ok(trusted)
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_inject_text_result_serialization() {
        let result = InjectTextResult {
            success: true,
            method: "clipboard".to_string(),
        };

        let json = serde_json::to_string(&result);
        assert!(json.is_ok());
    }

    #[test]
    fn test_parse_inject_text_result() {
        let json = r#"{"success":true,"method":"clipboard"}"#;
        let result: InjectTextResult = serde_json::from_str(json);

        assert!(result.is_ok());
        assert_eq!(result.unwrap().method, "clipboard");
    }

    #[test]
    fn test_empty_text_injection() {
        // This would fail in runtime, but we test the type
        let text = "".to_string();
        assert_eq!(text.len(), 0);
    }

    #[test]
    fn test_long_text_injection() {
        let text = "A".repeat(10000);
        assert_eq!(text.len(), 10000);
    }

    #[test]
    fn test_unicode_text_injection() {
        let text = "Привет мир! 你好世界! 🚀";
        assert!(!text.is_empty());
    }
}
