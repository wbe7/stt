use serde::{Deserialize, Serialize};
use core_foundation::base::{TCFType, CFTypeRef};
use core_foundation::dictionary::{CFDictionary, CFDictionaryRef};
use core_foundation::boolean::CFBoolean;
use core_foundation::string::CFString;
use cocoa::base::nil;
use objc::{msg_send, class, sel, sel_impl};
use std::ffi::c_void;

#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
    pub fn AXIsProcessTrustedWithOptions(options: CFDictionaryRef) -> bool;
}

#[link(name = "TCC", kind = "framework")]
extern "C" {
    pub fn TCCAccessPreflight(service: CFStringRef, client: CFStringRef) -> bool;
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PermissionStatus {
    pub accessibility: bool,
    pub microphone: bool,
}

unsafe fn check_microphone_permission() -> bool {
    let service = CFString::new("kTCCServiceMicrophone");

    let bundle: cocoa::base::id = msg_send![class!(NSBundle), mainBundle];
    if bundle == nil {
        return false;
    }

    let bundle_id: cocoa::base::id = msg_send![bundle, bundleIdentifier];
    if bundle_id == nil {
        return false;
    }

    let bundle_id_str: *const i8 = msg_send![bundle_id, UTF8String];
    let bundle_id_string = std::ffi::CStr::from_ptr(bundle_id_str)
        .to_string_lossy()
        .into_owned();

    let client = CFString::new(&bundle_id_string);

    TCCAccessPreflight(service.as_concrete_TypeRef(), client.as_concrete_TypeRef())
}

#[tauri::command]
pub async fn check_permissions() -> Result<PermissionStatus, String> {
    #[cfg(target_os = "macos")]
    {
        unsafe {
            let options_key = CFString::new("AXTrustedCheckOptionPrompt");
            let options_value = CFBoolean::false_value();

            let options = CFDictionary::from_CFType_pairs(&[(options_key.as_CFType(), options_value.as_CFType())]);

            let accessibility_trusted = AXIsProcessTrustedWithOptions(options.as_concrete_TypeRef());
            let microphone_granted = check_microphone_permission();

            Ok(PermissionStatus {
                accessibility: accessibility_trusted,
                microphone: microphone_granted,
            })
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(PermissionStatus {
            accessibility: false,
            microphone: false,
        })
    }
}

#[tauri::command]
pub async fn open_privacy_settings(setting_type: String) -> Result<(), String> {
    let url = match setting_type.as_str() {
        "accessibility" => "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility",
        "microphone" => "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone",
        _ => return Err("Invalid setting type".to_string()),
    };

    std::process::Command::new("open")
        .arg(url)
        .spawn()
        .map_err(|e| format!("Failed to open settings: {}", e))?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_permission_status_serialization() {
        let status = PermissionStatus {
            accessibility: true,
            microphone: true,
        };

        let json = serde_json::to_string(&status);
        assert!(json.is_ok());
    }
}