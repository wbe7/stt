# 🚀 Ultimate Roadmap: The "Wispr Flow Killer"

This roadmap is designed to build a superior, privacy-focused, and smarter alternative to Wispr Flow.

## 🧠 Core Philosophy
1.  **Speed is Feature #1:** Instant startup, instant recording, instant transcription.
2.  **Invisible UI:** The app should be invisible until needed, then beautiful, then invisible again.
3.  **Context Aware:** It adapts to *where* you are typing (Code vs. Chat).
4.  **Resilient:** Hybrid architecture (Cloud Default + Local Option).

---

## 🔥 Phase 0: Hardware & OS Integration (The "It Just Works" Layer)
*Goal: Ensure the app behaves like a native citizen of macOS.*

- [ ] **Audio Hardware Management**
    - [ ] **Microphone Selector**: Dropdown in settings to choose input device.
    - [ ] **Hot-plugging**: Auto-detect when devices are added/removed (e.g., AirPods connected).
    - [ ] **Visual Feedback**: Small level meter in settings to test the mic.
- [ ] **System Tray (Menu Bar)**
    - [ ] Icon in the macOS top bar.
    - [ ] Menu items: "Settings", "Check for Updates", "Quit".
    - [ ] Ability to open Settings even if the main widget is hidden.
- [ ] **Launch at Login**
    - [ ] Integrate `tauri-plugin-autostart`.
    - [ ] Add toggle in Settings: "Start at login".

---

## 🏗️ Phase 1: Critical Stabilization (Immediate Fixes)
*Goal: Fix the broken foundation.*

- [ ] **Fix Global Hotkey Registration**
    - [ ] `App.tsx`: Implement `useEffect` to call `registerHotkey` on mount.
    - [ ] Add conflict detection: If the hotkey is taken, warn the user.
- [ ] **Permission Guard System**
    - [ ] **Startup Check**: On launch, verify `Accessibility` and `Microphone` permissions.
    - [ ] **Blocker UI**: If permissions missing, show a friendly setup screen.
    - [ ] **Deep Links**: Add buttons to open macOS System Settings directly.
    - [ ] **Polling**: Auto-detect when permission is granted.
- [ ] **Restore & Connect VoiceRecorder**
    - [ ] Re-create `VoiceRecorder.tsx`.
    - [ ] Connect `src/lib/audio/recorder.ts` to global hotkey events.
    - [ ] Verify pipeline: Stop Rec -> Get Audio -> API Call -> Text Injection.

---

## 💎 Phase 2: The "Flow" UX (Visuals & Animation)
*Goal: Move from "Window" to "Intelligent Widget".*

### Window Management
- [ ] **Compact Floating Capsule**
    - [ ] Config: `width: ~400px`, `height: ~60px`, `transparent`, `alwaysOnTop`, `no-decorations`.
    - [ ] Position: Bottom-center (floating above the dock).
    - [ ] **Behavior**: 
        - [ ] Auto-hide when idle.
        - [ ] Instant fade-in on hotkey press.
        - [ ] "Shake" animation on error.

### Design System: "Glass & Motion"
- [ ] **Visualizer Bar**: Realtime audio waveform using `Canvas` or CSS bars.
- [ ] **States & Transitions**:
    - [ ] **Listening**: Red/Warm pulse.
    - [ ] **Thinking**: Blue/Cool shimmer (skeleton loading effect).
    - [ ] **Success**: Green flash/Checkmark -> Fade out.
- [ ] **Theme**: Adaptive (System Dark/Light), utilizing `backdrop-blur-xl`.

---

## 🎮 Phase 3: Advanced Interaction Logic
*Goal: The perfect "Hold" vs "Toggle" experience.*

### The Smart Hotkey
- [ ] **Interaction State Machine**:
    - [ ] **Hold Mode**: Press & Hold -> Record -> Release -> Stop.
    - [ ] **Toggle Mode**: Press Hotkey + `Space` -> Lock Recording -> Hands-free.
    - [ ] **Cancel**: Press `Esc` to discard audio.
- [ ] **Custom Hotkey Manager**:
    - [ ] Support for single keys (e.g., `F1`, `§`) via `rdev` or Tauri hooks.
    - [ ] Allow remapping "Record", "Commit", and "Cancel".

### Audio Feedback (Sound UX)
- [ ] **Sound Cues**: Add subtle sounds for non-visual feedback.
    - [ ] `start.mp3`, `stop.mp3`, `success.mp3`, `error.mp3`.
- [ ] Add "Mute Sounds" toggle.

---

## 🧠 Phase 4: Intelligence & Context (The X-Factor)
*Goal: Be smarter than the competition.*

### Context Awareness
- [ ] **Active App Detection**: Detect focused app bundle ID.
- [ ] **Dynamic System Prompt**:
    - [ ] **Dev Mode** (VS Code, Terminal): Preserve code, camelCase.
    - [ ] **Chat Mode** (Slack, Telegram): Casual tone.
    - [ ] **Pro Mode** (Mail, Word): Formal tone.

### Post-Processing Voice Commands
- [ ] **"Magic Edit"**: Detect commands at the end of recording (e.g., "Make it shorter").

---

## ⚡ Phase 5: "Killer" Performance & Flexibility
*Goal: Options for every user type.*

### Multi-Engine Support
- [ ] **OpenRouter (Default)**: Best balance.
- [ ] **Custom OpenAI-Compatible API**: Any provider (OpenAI, DeepSeek, Azure).
- [ ] **Groq Integration**: Extreme speed.
- [ ] **Local LLM (Ollama)**: Privacy/Offline.

### Smart Injection & Undo Safety
- [ ] **Injection Method Selector**:
    - [ ] **Simulation (Cmd+V)**: Safer for "Undo" history.
    - [ ] **Accessibility API**: Faster, but might break Undo stack.
- [ ] **Smart Spacing**: Auto-insert space before text.
- [ ] **Paste Queue**: Handle rapid-fire dictations.

---

## 🛠 Phase 6: Engineering Excellence (DevOps & Quality)
*Goal: Make it a real product.*

### Distribution & Updates
- [ ] **GitHub Actions**: Automate builds.
- [ ] **Notarization**: Sign app with Apple Developer ID (avoid "Damaged" warnings).
- [ ] **Auto-Updater**: Configure Tauri updater.

### Localization (i18n)
- [ ] **UI Translation**: English / Russian.

### Resilience
- [ ] **Network Handling**: Graceful timeouts.
- [ ] **Error Reporting**: Local log collection.
