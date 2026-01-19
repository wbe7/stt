use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PermissionStatus {
    pub accessibility: bool,
    pub microphone: bool,
}

#[tauri::command]
pub async fn check_permissions() -> Result<PermissionStatus, String> {
    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::NSWorkspace;
        use cocoa::base::{id, nil};
        use objc::runtime::Object;
        use objc::{msg_send, sel, sel_impl};

        unsafe {
            let options = cocoa::foundation::NSDictionary::dictionaryWithObject_forKey_(
                nil,
                cocoa::foundation::NSNumber::numberWithBool_(nil, false),
                cocoa::foundation::NSString::alloc(nil).init_str(
                    "AXTrustedCheckOptionPrompt",
                ),
            );

            let accessibility_trusted: bool = msg_send![
                class!(AXIsProcessTrustedWithOptions:),
                options
            ];

            Ok(PermissionStatus {
                accessibility: accessibility_trusted,
                microphone: true,
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

    #[test]
    fn test_permission_status_deserialization() {
        let json = r#"{"accessibility":true,"microphone":false}"#;
        let status: PermissionStatus = serde_json::from_str(json);

        assert!(status.is_ok());
        let status = status.unwrap();
        assert_eq!(status.accessibility, true);
        assert_eq!(status.microphone, false);
    }

    #[test]
    fn test_all_permissions_granted() {
        let status = PermissionStatus {
            accessibility: true,
            microphone: true,
        };

        assert!(status.accessibility);
        assert!(status.microphone);
    }

    #[test]
    fn test_no_permissions_granted() {
        let status = PermissionStatus {
            accessibility: false,
            microphone: false,
        };

        assert!(!status.accessibility);
        assert!(!status.microphone);
    }

    #[test]
    fn test_partial_permissions_granted() {
        let status = PermissionStatus {
            accessibility: true,
            microphone: false,
        };

        assert!(status.accessibility);
        assert!(!status.microphone);
    }
}
