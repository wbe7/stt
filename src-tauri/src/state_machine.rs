use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq)]
pub enum RecordingMode {
    Hold,
    Toggle,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateMachine {
    pub is_recording: bool,
    pub mode: RecordingMode,
    pub start_time: Option<u64>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Event {
    Press,
    Release,
    Cancel,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Action {
    Start,
    Commit,
    Cancel,
    None,
}

impl Default for StateMachine {
    fn default() -> Self {
        StateMachine {
            is_recording: false,
            mode: RecordingMode::Hold,
            start_time: None,
        }
    }
}

impl StateMachine {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn transition(&mut self, event: Event, timestamp: u64) -> Action {
        match (self.is_recording, &self.mode, &event) {
            (false, RecordingMode::Hold, Event::Press) => {
                self.is_recording = true;
                self.start_time = Some(timestamp);
                Action::Start
            }
            (true, RecordingMode::Hold, Event::Release) => {
                self.is_recording = false;
                self.start_time = None;
                Action::Commit
            }
            (true, _, Event::Cancel) => {
                self.is_recording = false;
                self.start_time = None;
                Action::Cancel
            }
            (false, RecordingMode::Toggle, Event::Press) => {
                self.is_recording = true;
                self.start_time = Some(timestamp);
                Action::Start
            }
            (true, RecordingMode::Toggle, Event::Press) => {
                self.is_recording = false;
                self.start_time = None;
                Action::Commit
            }
            _ => Action::None,
        }
    }

    pub fn set_mode(&mut self, mode: RecordingMode) {
        self.mode = mode;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hold_mode_press_starts_recording() {
        let mut sm = StateMachine::new();
        sm.set_mode(RecordingMode::Hold);
        let action = sm.transition(Event::Press, 1000);
        assert_eq!(action, Action::Start);
        assert!(sm.is_recording);
        assert_eq!(sm.start_time, Some(1000));
    }

    #[test]
    fn test_hold_mode_release_commits() {
        let mut sm = StateMachine::new();
        sm.set_mode(RecordingMode::Hold);
        sm.transition(Event::Press, 1000);
        let action = sm.transition(Event::Release, 2000);
        assert_eq!(action, Action::Commit);
        assert!(!sm.is_recording);
        assert_eq!(sm.start_time, None);
    }

    #[test]
    fn test_toggle_mode_press_starts_recording() {
        let mut sm = StateMachine::new();
        sm.set_mode(RecordingMode::Toggle);
        let action = sm.transition(Event::Press, 1000);
        assert_eq!(action, Action::Start);
        assert!(sm.is_recording);
        assert_eq!(sm.start_time, Some(1000));
    }

    #[test]
    fn test_toggle_mode_press_commits() {
        let mut sm = StateMachine::new();
        sm.set_mode(RecordingMode::Toggle);
        sm.transition(Event::Press, 1000);
        let action = sm.transition(Event::Press, 2000);
        assert_eq!(action, Action::Commit);
        assert!(!sm.is_recording);
        assert_eq!(sm.start_time, None);
    }

    #[test]
    fn test_cancel_from_recording() {
        let mut sm = StateMachine::new();
        sm.set_mode(RecordingMode::Hold);
        sm.transition(Event::Press, 1000);
        let action = sm.transition(Event::Cancel, 1500);
        assert_eq!(action, Action::Cancel);
        assert!(!sm.is_recording);
        assert_eq!(sm.start_time, None);
    }

    #[test]
    fn test_idle_cancel_does_nothing() {
        let mut sm = StateMachine::new();
        let action = sm.transition(Event::Cancel, 1000);
        assert_eq!(action, Action::None);
        assert!(!sm.is_recording);
    }

    #[test]
    fn test_hold_release_when_idle_does_nothing() {
        let mut sm = StateMachine::new();
        sm.set_mode(RecordingMode::Hold);
        let action = sm.transition(Event::Release, 1000);
        assert_eq!(action, Action::None);
        assert!(!sm.is_recording);
    }

    #[test]
    fn test_toggle_release_does_nothing() {
        let mut sm = StateMachine::new();
        sm.set_mode(RecordingMode::Toggle);
        let action = sm.transition(Event::Release, 1000);
        assert_eq!(action, Action::None);
        assert!(!sm.is_recording);
    }
}