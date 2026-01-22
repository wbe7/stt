use serde::{Deserialize, Serialize};
use core_foundation::base::{TCFType, CFTypeRef};
use core_foundation::dictionary::{CFDictionary, CFDictionaryRef};
use core_foundation::boolean::CFBoolean;
use core_foundation::string::CFString;

#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
    pub fn AXIsProcessTrustedWithOptions(options: CFDictionaryRef) -> bool;
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PermissionStatus {
    pub accessibility: bool,
    pub microphone: bool,
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

            Ok(PermissionStatus {
                accessibility: accessibility_trusted,
                microphone: true, // TODO: Implement microphone permission check
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