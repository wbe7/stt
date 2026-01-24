use cocoa::appkit::{NSApplication, NSRunningApplication};
use cocoa::base::{id, nil};
use cocoa::foundation::{NSString, NSPoint, NSRange};
use core_foundation::base::{TCFType, CFTypeRef};
use core_foundation::string::{CFString, CFStringRef};
use core_foundation::dictionary::{CFDictionary, CFDictionaryRef};
use core_foundation::boolean::CFBoolean;
use core_graphics::event::{CGEvent, CGEventTapLocation, CGKeyCode, CGEventFlags};
use core_graphics::event_source::CGEventSource;
use objc::runtime::Object;
use objc::{msg_send, sel, sel_impl, class};
use serde::{Deserialize, Serialize};
use std::ptr;
use std::ffi::c_void;
use lazy_static::lazy_static;
use std::sync::Arc;
use tokio::sync::Mutex;

#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
    pub fn AXIsProcessTrustedWithOptions(options: CFDictionaryRef) -> bool;
    pub fn AXUIElementCreateSystemWide() -> CFTypeRef;
    pub fn AXUIElementCopyAttributeValue(element: CFTypeRef, attribute: CFStringRef, value: *mut CFTypeRef) -> i32;
    pub fn AXUIElementSetAttributeValue(element: CFTypeRef, attribute: CFStringRef, value: CFTypeRef) -> i32;
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InjectTextResult {
    pub success: bool,
    pub method: String,
    pub message: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FocusedAppInfo {
    pub bundle_id: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InjectionRequest {
    pub text: String,
    pub method: Option<String>,
    pub smart_spacing: bool,
}

lazy_static! {
    static ref INJECTION_QUEUE: Arc<Mutex<Vec<InjectionRequest>>> = Arc::new(Mutex::new(Vec::new()));
    static ref IS_PROCESSING: Arc<Mutex<bool>> = Arc::new(Mutex::new(false));
}

#[tauri::command]
pub async fn get_focused_app() -> Result<FocusedAppInfo, String> {
    #[cfg(target_os = "macos")]
    {
        unsafe {
            let workspace: id = msg_send![class!(NSWorkspace), sharedWorkspace];
            let app: id = msg_send![workspace, frontmostApplication];

            if app == nil {
                return Ok(FocusedAppInfo {
                    bundle_id: "unknown".to_string(),
                    name: "unknown".to_string(),
                });
            }

            let bundle_id: id = msg_send![app, bundleIdentifier];
            let name: id = msg_send![app, localizedName];

            if bundle_id == nil || name == nil {
                return Ok(FocusedAppInfo {
                    bundle_id: "unknown".to_string(),
                    name: "unknown".to_string(),
                });
            }

            let bundle_id_str: *const i8 = msg_send![bundle_id, UTF8String];
            let name_str: *const i8 = msg_send![name, UTF8String];

            let bundle_id_string = std::ffi::CStr::from_ptr(bundle_id_str)
                .to_string_lossy()
                .into_owned();

            let name_string = std::ffi::CStr::from_ptr(name_str)
                .to_string_lossy()
                .into_owned();

            Ok(FocusedAppInfo {
                bundle_id: bundle_id_string,
                name: name_string,
            })
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Unsupported platform".to_string())
    }
}

async fn inject_text_logic(text: String, method: Option<String>, smart_spacing: bool) -> Result<InjectTextResult, String> {
    if text.is_empty() {
        return Ok(InjectTextResult {
            success: true,
            method: "empty".to_string(),
            message: None,
        });
    }



    #[cfg(target_os = "macos")]
    {
        unsafe {
            if let Some(method) = method {
                if method == "clipboard" {
                    return inject_text_via_clipboard(&text);
                } else {
                match inject_text_via_accessibility(&text, smart_spacing) {
                    Ok(result) => Ok(result),
                    Err(_) => inject_text_via_clipboard(&text),
                }
                }
            } else {
                let permission_granted = check_accessibility_permission_internal(false);
                if !permission_granted {
                    return inject_text_via_clipboard(&text);
                }
                match inject_text_via_accessibility(&text, smart_spacing) {
                    Ok(result) => Ok(result),
                    Err(_) => inject_text_via_clipboard(&text),
                }
            }
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(InjectTextResult {
            success: false,
            method: "unsupported_platform".to_string(),
            message: Some("Platform not supported".to_string()),
        })
    }
}

#[tauri::command]
pub async fn inject_text(text: String, method: Option<String>, smart_spacing: bool) -> Result<InjectTextResult, String> {
    inject_text_logic(text, method, smart_spacing).await
}

#[tauri::command]
pub async fn queue_inject_text(request: InjectionRequest) -> Result<(), String> {
    let mut queue = INJECTION_QUEUE.lock().await;
    queue.push(request);
    drop(queue);

    let mut is_processing = IS_PROCESSING.lock().await;
    if !*is_processing {
        *is_processing = true;
        drop(is_processing);
        tokio::spawn(async move {
            process_queue().await;
        });
    }
    Ok(())
}

async fn process_queue() {
    loop {
        let request = {
            let mut queue = INJECTION_QUEUE.lock().await;
            if queue.is_empty() {
                let mut is_processing = IS_PROCESSING.lock().await;
                *is_processing = false;
                return;
            }
            queue.remove(0)
        };

        let _ = inject_text_logic(request.text, request.method, request.smart_spacing).await;
    }
}

unsafe fn check_accessibility_permission_internal(prompt: bool) -> bool {
    let options_key = CFString::new("AXTrustedCheckOptionPrompt");
    let options_value = if prompt {
        CFBoolean::true_value()
    } else {
        CFBoolean::false_value()
    };

    let options = CFDictionary::from_CFType_pairs(&[(options_key.as_CFType(), options_value.as_CFType())]);

    let trusted = AXIsProcessTrustedWithOptions(options.as_concrete_TypeRef());

    trusted
}

unsafe fn inject_text_via_accessibility(text: &str, smart_spacing: bool) -> Result<InjectTextResult, String> {
    let kAXFocusedUIElementAttribute = CFString::new("AXFocusedUIElement");
    let kAXRoleAttribute = CFString::new("AXRole");
    let kAXSelectedTextAttribute = CFString::new("AXSelectedText");
    let kAXTextFieldRole = "AXTextField";
    let kAXTextAreaRole = "AXTextArea";

    let system_wide_element = AXUIElementCreateSystemWide();
    if system_wide_element.is_null() {
        return Err("Failed to create system wide element".to_string());
    }

    let mut focused_element: CFTypeRef = ptr::null_mut();
    let result = AXUIElementCopyAttributeValue(
        system_wide_element,
        kAXFocusedUIElementAttribute.as_concrete_TypeRef(),
        &mut focused_element,
    );

    if result != 0 {
        return Err("Failed to get focused element".to_string());
    }

    if focused_element.is_null() {
        return Err("No focused element".to_string());
    }

    let mut role_value: CFTypeRef = ptr::null_mut();
    let role_result = AXUIElementCopyAttributeValue(
        focused_element,
        kAXRoleAttribute.as_concrete_TypeRef(),
        &mut role_value,
    );

    if role_result != 0 {
        return Err("Failed to get element role".to_string());
    }

    if role_value.is_null() {
        return Err("No element role".to_string());
    }

    let role_cf_string: id = role_value as id;
    let role_utf8: *const i8 = msg_send![role_cf_string, UTF8String];
    let role_string = std::ffi::CStr::from_ptr(role_utf8)
        .to_string_lossy()
        .into_owned();

    if role_string != kAXTextFieldRole && role_string != kAXTextAreaRole {
        return Err("Focused element is not a text field".to_string());
    }

    let mut injected_text = text.to_string();

    if smart_spacing {
        let kAXValueAttribute = CFString::new("AXValue");
        let kAXSelectedTextRangeAttribute = CFString::new("AXSelectedTextRange");

        let mut value_ref: CFTypeRef = ptr::null_mut();
        let value_result = AXUIElementCopyAttributeValue(
            focused_element,
            kAXValueAttribute.as_concrete_TypeRef(),
            &mut value_ref,
        );

        if value_result == 0 && !value_ref.is_null() {
            let value_cf_string: id = value_ref as id;
            let value_utf8: *const i8 = msg_send![value_cf_string, UTF8String];
            let full_text = std::ffi::CStr::from_ptr(value_utf8).to_string_lossy().into_owned();

            let mut range_ref: CFTypeRef = ptr::null_mut();
            let range_result = AXUIElementCopyAttributeValue(
                focused_element,
                kAXSelectedTextRangeAttribute.as_concrete_TypeRef(),
                &mut range_ref,
            );

            if range_result == 0 && !range_ref.is_null() {
                let range: NSRange = unsafe { *(range_ref as *const NSRange) };
                let location = range.location as usize;
                let previous_char = if location > 0 {
                    full_text.chars().nth(location - 1)
                } else {
                    None
                };
                if should_prepend_space(previous_char, &injected_text) {
                    injected_text = format!(" {}", injected_text);
                }
            }
        }
    }

    let ns_text = NSString::alloc(nil).init_str(&injected_text);

    let set_result = AXUIElementSetAttributeValue(
        focused_element,
        kAXSelectedTextAttribute.as_concrete_TypeRef(),
        ns_text as *const _ as *const c_void,
    );

    if set_result != 0 {
        return Err("Failed to set selected text attribute".to_string());
    }

    Ok(InjectTextResult {
        success: true,
        method: "accessibility".to_string(),
        message: None,
    })
}

fn apply_smart_spacing(text: &str, smart_spacing: bool) -> String {
    if smart_spacing && !text.is_empty() && !text.starts_with(' ') {
        format!(" {}", text)
    } else {
        text.to_string()
    }
}

fn should_prepend_space(previous_char: Option<char>, text: &str) -> bool {
    if text.is_empty() {
        return false;
    }
    if text.starts_with(' ') {
        return false;
    }
    if let Some(ch) = previous_char {
        !ch.is_whitespace()
    } else {
        false
    }
}

unsafe fn inject_text_via_clipboard(text: &str) -> Result<InjectTextResult, String> {
    let ns_text = NSString::alloc(nil).init_str(text);

    let pasteboard: id = msg_send![class!(NSPasteboard), generalPasteboard];
    if pasteboard == nil {
        return Err("Failed to get pasteboard".to_string());
    }

    let _: () = msg_send![pasteboard, clearContents];

    let utf8_type = CFString::new("public.utf8-plain-text");
    let _: () = msg_send![pasteboard, setString:ns_text forType:utf8_type.as_concrete_TypeRef()];

    let event_source: id = msg_send![class!(CGEventSource), new];
    if event_source == nil {
        return Err("Failed to create event source".to_string());
    }

    let workspace: id = msg_send![class!(NSWorkspace), sharedWorkspace];
    let app: id = msg_send![workspace, frontmostApplication];

    if app == nil {
        return Err("No focused application".to_string());
    }

    let process_id: u32 = msg_send![app, processIdentifier];

    let key_down: id = msg_send![
        class!(CGEvent),
        keyboardEventWithEventSource: event_source
        location: NSPoint::new(0.0, 0.0)
        flags: 0x10000
        virtualKey: 9
        keyIsDown: true
    ];

    let key_up: id = msg_send![
        class!(CGEvent),
        keyboardEventWithEventSource: event_source
        location: NSPoint::new(0.0, 0.0)
        flags: 0x10000
        virtualKey: 9
        keyIsDown: false
    ];

    let _: () = msg_send![key_down, postToPid: process_id];
    let _: () = msg_send![key_up, postToPid: process_id];

    Ok(InjectTextResult {
        success: true,
        method: "clipboard".to_string(),
        message: None,
    })
}

#[tauri::command]
pub async fn request_permission() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        unsafe {
            let granted = check_accessibility_permission_internal(true);
            Ok(granted)
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(false)
    }
}

#[tauri::command]
pub async fn check_permission() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        unsafe {
            let granted = check_accessibility_permission_internal(false);
            Ok(granted)
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
            method: "accessibility".to_string(),
            message: None,
        };

        let json = serde_json::to_string(&result);
        assert!(json.is_ok());

        let expected = r#"{"success":true,"method":"accessibility","message":null}"#;
        assert_eq!(json.unwrap(), expected);
    }

    #[test]
    fn test_parse_inject_text_result() {
        let json = r#"{"success":true,"method":"clipboard","message":null}"#;
        let result: InjectTextResult = serde_json::from_str(json);

        assert!(result.is_ok());
        let result = result.unwrap();
        assert_eq!(result.method, "clipboard");
        assert_eq!(result.success, true);
        assert_eq!(result.message, None);
    }

    #[test]
    fn test_focused_app_info_serialization() {
        let info = FocusedAppInfo {
            bundle_id: "com.apple.TextEdit".to_string(),
            name: "TextEdit".to_string(),
        };

        let json = serde_json::to_string(&info);
        assert!(json.is_ok());

        let expected = r#"{"bundle_id":"com.apple.TextEdit","name":"TextEdit"}"#;
        assert_eq!(json.unwrap(), expected);
    }

    #[test]
    fn test_parse_focused_app_info() {
        let json = r#"{"bundle_id":"com.example.app","name":"Example App"}"#;
        let info: FocusedAppInfo = serde_json::from_str(json).unwrap();

        assert_eq!(info.bundle_id, "com.example.app");
        assert_eq!(info.name, "Example App");
    }

    #[test]
    fn test_apply_smart_spacing() {
        assert_eq!(apply_smart_spacing("", true), "");
        assert_eq!(apply_smart_spacing("hello", true), " hello");
        assert_eq!(apply_smart_spacing(" hello", true), " hello");
        assert_eq!(apply_smart_spacing("hello", false), "hello");
    }

    #[test]
    fn test_should_prepend_space() {
        assert_eq!(should_prepend_space(Some('a'), "hello"), true);
        assert_eq!(should_prepend_space(Some(' '), "hello"), false);
        assert_eq!(should_prepend_space(None, "hello"), false);
        assert_eq!(should_prepend_space(Some('a'), " hello"), false);
        assert_eq!(should_prepend_space(Some('a'), ""), false);
        assert_eq!(should_prepend_space(Some('\n'), "hello"), false);
    }
}