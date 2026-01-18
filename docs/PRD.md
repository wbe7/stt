# PRD - Voice Dictation App (Wispr Flow Clone)

## 🎯 Project Overview

Voice dictation AI application that turns speech into polished text with intelligent editing. Built with Next.js 15, Tauri v2, and OpenRouter API (Whisper + GPT-4o mini).

### Key Features
- **Hold to Record**: Press and hold hotkey to record, release to process
- **Toggle Mode**: Press hotkey + space to lock recording, press checkmark to submit
- **Smart Editing**: Remove filler words, fix stuttering, preserve technical terms
- **Universal**: Works in any macOS application via text injection
- **Customizable**: Remap hotkeys, choose models, adjust editing level

---

## 📦 Tech Stack

```
Frontend:    Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
Desktop:     Tauri v2 (Rust backend)
AI:          OpenRouter API
              - Whisper v3 (transcription)
              - GPT-4o mini (intelligent editing)
State:       Zustand
Audio:       Web Audio API
Hotkeys:     Tauri Global Shortcut Plugin
Injection:   macOS Accessibility API (AXUIElementSetAttributeValue)
Testing:     Vitest + React Testing Library + TDD
```

---

## 🎨 UX Flow

### Mode 1: Hold to Record (Default)
1. **Press & hold** hotkey (default: `Cmd+Shift+V`) → start recording
2. **Hold & speak** → continue recording
3. **Release** hotkey → stop → process → auto-insert text

### Mode 2: Toggle Mode
1. **Press** hotkey + `Space` → lock recording (can release)
2. **Speak freely** → continue recording
3. **Press** checkmark/Enter → stop → process → auto-insert text

### Settings
- Remap hotkeys
- Choose model (GPT-4o / GPT-4o mini / Claude)
- Adjust editing level (minimal/medium/aggressive)
- Set default language (Russian + English terms)

---

## 📁 Project Structure

```
stt/
├── docs/
│   └── PRD.md
├── .env                                    # OpenRouter API Key
├── AGENTS.md                              # Instruction for AI agents
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── tailwind.config.ts
│
├── src/
│   ├── app/
│   │   ├── page.tsx                       # Main page
│   │   ├── layout.tsx                     # Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                            # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── switch.tsx
│   │   │   └── toast.tsx
│   │   └── features/
│   │       ├── VoiceRecorder/             # Recording component
│   │       │   ├── VoiceRecorder.tsx
│   │       │   ├── RecordingIndicator.tsx
│   │       │   └── index.ts
│   │       ├── Transcription/              # Text display
│   │       │   ├── TranscriptionDisplay.tsx
│   │       │   ├── TranscriptionHistory.tsx
│   │       │   └── index.ts
│   │       └── Settings/                   # Settings
│   │           ├── SettingsPanel.tsx
│   │           ├── HotkeyEditor.tsx
│   │           ├── ModelSelector.tsx
│   │           └── index.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── openrouter/
│   │   │   │   ├── client.ts              # OpenRouter API client
│   │   │   │   ├── whisper.ts             # Whisper transcription
│   │   │   │   ├── gpt-edit.ts            # GPT-4o editing
│   │   │   │   └── types.ts               # API types
│   │   │   └── types.ts
│   │   │
│   │   ├── audio/
│   │   │   ├── recorder.ts                # Web Audio API
│   │   │   ├── converter.ts               # WebM → WAV conversion
│   │   │   ├── silence-detector.ts        # Silence detection
│   │   │   └── types.ts
│   │   │
│   │   ├── prompts/
│   │   │   ├── edit-text-prompt.ts        # GPT-4o editing prompt
│   │   │   └── utils.ts
│   │   │
│   │   └── utils.ts
│   │
│   ├── store/
│   │   ├── app-store.ts                   # Zustand global store
│   │   ├── audio-store.ts                 # Audio state
│   │   └── settings-store.ts              # Settings state
│   │
│   ├── hooks/
│   │   ├── useVoiceRecorder.ts            # Custom recording hook
│   │   ├── useTranscription.ts            # Custom transcription hook
│   │   ├── useGlobalHotkey.ts             # Tauri hotkey hook
│   │   └── useClipboard.ts                # Clipboard operations
│   │
│   ├── types/
│   │   ├── index.ts                       # Main types
│   │   ├── audio.ts                       # Audio types
│   │   ├── transcription.ts               # Transcription types
│   │   └── settings.ts                    # Settings types
│   │
│   └── __tests__/                         # Tests
│       ├── setup.ts                       # Test setup
│       ├── unit/
│       │   ├── audio/
│       │   │   ├── recorder.test.ts
│       │   │   ├── converter.test.ts
│       │   │   └── silence-detector.test.ts
│       │   ├── api/
│       │   │   ├── whisper.test.ts
│       │   │   ├── gpt-edit.test.ts
│       │   │   └── client.test.ts
│       │   ├── prompts/
│       │   │   └── edit-text-prompt.test.ts
│       │   └── utils.test.ts
│       ├── integration/
│       │   └── voice-flow.test.ts
│       └── components/
│           ├── VoiceRecorder.test.tsx
│           ├── TranscriptionDisplay.test.tsx
│           └── SettingsPanel.test.tsx
│
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── lib.rs                         # Tauri entry point
│       ├── main.rs
│       ├── commands/
│       │   ├── hotkey.rs                  # Global shortcuts
│       │   ├── accessibility.rs           # Text injection (AXAPI)
│       │   ├── clipboard.rs               # Clipboard operations
│       │   ├── mod.rs
│       │   └── permissions.rs             # Accessibility permissions
│       └── utils/
│           ├── hotkey_parser.rs
│           └── mac_accessibility.rs
│
└── public/
    └── icons/                             # App icons
```

---

## 🧪 Comprehensive Test Suite

### Test Coverage Summary: 126 tests

| Module | Unit Tests | Component Tests | Rust Tests |
|--------|-----------|---------------|-----------|
| Audio | 30 | 13 | - |
| API | 27 | 7 | - |
| Prompts | 8 | - | - |
| Store | 14 | - | - |
| Integration | 15 | - | - |
| Rust | - | - | 12 |
| **TOTAL** | **94** | **20** | **12** |

---

## 📋 Implementation Phases

### Phase 1: Project Setup (TDD)
- [ ] Initialize Next.js 15 + TypeScript + Tailwind
- [ ] Setup Tauri v2
- [ ] Setup Vitest + React Testing Library
- [ ] Create basic file structure
- [ ] Setup .env with API key
- [ ] Create AGENTS.md

**Tests:**
- [ ] Test project configuration
- [ ] Test build process

---

### Phase 2: Audio Recording (TDD)
- [ ] Implement VoiceRecorder (Web Audio API)
- [ ] Implement SilenceDetector
- [ ] Implement AudioConverter (WebM → WAV)
- [ ] UI: RecordingIndicator with visualization

**Unit tests:**
- [ ] recorder.test.ts (12 tests)
- [ ] silence-detector.test.ts (9 tests)
- [ ] converter.test.ts (9 tests)

**Component tests:**
- [ ] VoiceRecorder.test.tsx (8 tests)
- [ ] RecordingIndicator.test.tsx (5 tests)

---

### Phase 3: Whisper API Integration (TDD)
- [ ] OpenRouter API client
- [ ] Whisper transcription
- [ ] Error handling and retry
- [ ] UI: TranscriptionDisplay

**Unit tests:**
- [ ] client.test.ts (7 tests)
- [ ] whisper.test.ts (10 tests)

**Component tests:**
- [ ] TranscriptionDisplay.test.tsx (7 tests)

---

### Phase 4: GPT-4o Editing (TDD)
- [ ] Edit prompt for intelligent editing
- [ ] GPT-4o mini integration
- [ ] Test with various examples
- [ ] UI: EditedTextDisplay

**Unit tests:**
- [ ] gpt-edit.test.ts (10 tests)
- [ ] edit-text-prompt.test.ts (8 tests)

**Integration tests:**
- [ ] transcription → edit flow (5 tests)

---

### Phase 5: Global Hotkeys (Rust TDD)
- [ ] Tauri Global Shortcut Plugin
- [ ] Register hotkeys (default: Cmd+Shift+V)
- [ ] Handle Press/Release events
- [ ] Toggle Mode with Spacebar
- [ ] Rust tests for hotkey

**Rust tests:**
- [ ] hotkey.rs (6 tests)

**Integration tests:**
- [ ] hotkey → recording flow (4 tests)

---

### Phase 6: Text Injection (Rust TDD)
- [ ] macOS Accessibility API (AXUIElementSetAttributeValue)
- [ ] Get active application
- [ ] Insert text at cursor
- [ ] Fallback: Clipboard + Cmd+V
- [ ] Rust tests for accessibility

**Rust tests:**
- [ ] accessibility.rs (6 tests)

**Integration tests:**
- [ ] edit → inject flow (5 tests)

---

### Phase 7: Settings & Customization (TDD)
- [ ] Zustand store for settings
- [ ] UI: SettingsPanel
- [ ] UI: HotkeyEditor
- [ ] UI: ModelSelector
- [ ] Settings persistence

**Unit tests:**
- [ ] settings-store.test.ts (8 tests)

**Component tests:**
- [ ] SettingsPanel.test.tsx (6 tests)
- [ ] HotkeyEditor.test.tsx (7 tests)
- [ ] ModelSelector.test.tsx (5 tests)

---

### Phase 8: Menu Bar Integration
- [ ] Menu bar icon
- [ ] Quick actions (Record, Settings, Quit)
- [ ] Status indicator (Recording/Idle)

**Component tests:**
- [ ] MenuBar.test.tsx (4 tests)

---

### Phase 9: History & Stats
- [ ] Recording history (local storage)
- [ ] UI: TranscriptionHistory
- [ ] Usage statistics

**Unit tests:**
- [ ] history-store.test.ts (6 tests)

**Component tests:**
- [ ] TranscriptionHistory.test.tsx (5 tests)

---

### Phase 10: Polish & Optimization
- [ ] Performance optimization
- [ ] Error handling edge cases
- [ ] Accessibility improvements
- [ ] Documentation

**E2E tests:**
- [ ] Critical user flows (3 tests)

---

## 🔑 Environment Variables

```env
# OpenRouter API
OPENROUTER_API_KEY=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

# Default Models
DEFAULT_WHISPER_MODEL=whisper-1
DEFAULT_EDIT_MODEL=openai/gpt-4o-mini

# App Settings
DEFAULT_LANGUAGE=ru
MAX_AUDIO_SIZE_MB=25
RECORDING_TIMEOUT_MS=30000
SILENCE_THRESHOLD=0.01

# Tauri
TAURI_PRIVATE_KEY=
TAURI_KEY_PASSWORD=
```

---

## 🎨 UI Design (Wispr Flow Style)

### Color Palette
- Primary: `#3B82F6` (Blue)
- Success: `#10B981` (Green)
- Error: `#EF4444` (Red)
- Background: `#1E293B` (Dark Slate)
- Text: `#F8FAFC` (Light Gray)

### Typography
- Font: Inter / System UI
- Sizes: 14px base, 16px headings
- Weights: 400 regular, 500 medium, 600 semi-bold

### Components
- **Recording Indicator**: Pulsing circle with microphone icon
- **Settings Panel**: Minimalist modal with toggle switches
- **Hotkey Editor**: Input that captures key presses
- **Transcription Display**: Clean typography with syntax highlighting

---

## 🚀 Build & Test Commands

```bash
# Install
npm install
cd src-tauri && cargo install

# Development
npm run dev          # Next.js dev server
npm run tauri dev    # Tauri dev mode (includes Next.js)

# Testing
npm test             # Run all tests (Vitest + RTL)
npm test:watch       # Run tests in watch mode (TDD workflow)
npm test:ui          # Run Vitest UI
npm test:coverage     # Generate coverage report
npm test -- [test-file-name]           # Run specific test file
npm test -- -t "test name"             # Run tests matching pattern
npm test:watch -- [test-file-name]     # Watch specific file

# Build
npm run build          # Build Next.js for production
npm run tauri build    # Build Tauri app for current platform

# Linting & Formatting
npm run lint              # ESLint check
npm run lint:fix          # ESLint auto-fix
npm run format            # Prettier format
npm run format:check      # Prettier check
npm run type-check        # TypeScript type checking
```

---

## 💡 Smart Editing Prompt

### Example Use Cases

**Input:** "нуу ээ это надо сделать деплой хмм через верфь"
**Output:** "Надо сделать деплой через werf"

**Input:** "я я я хочу чтобы ты написал код для рест апи"
**Output:** "Я хочу, чтобы ты написал код для REST API"

**Input:** "создай компонент реакт который будет показывать список товаров"
**Output:** "Создай компонент React, который будет показывать список товаров"

### Editing Rules
1. Remove filler words: "ээ", "мээ", "хмм", "ну", "это", "типа", "короче"
2. Remove repeats and stuttering: "я я я" → "я"
3. Fix mispronounced words while preserving meaning
4. Add proper punctuation
5. Preserve original user tone
6. Keep technical terms in English (werf, docker, k8s, npm, etc.)
7. DO NOT rewrite the meaning, only fix the form

---

## 🎯 Success Criteria

- [ ] Record audio with single hotkey press (hold to record)
- [ ] Toggle mode for hands-free recording
- [ ] Whisper API transcribes speech accurately (95%+ accuracy)
- [ ] GPT-4o mini intelligently edits text (removes fillers, fixes stuttering)
- [ ] Text auto-injects into active macOS application
- [ ] Fallback to clipboard if injection fails
- [ ] Customizable hotkeys and settings
- [ ] All 126 tests passing
- [ ] Coverage > 80%
- [ ] Build succeeds for macOS
- [ ] App installs and runs without errors

---

## 📅 Timeline Estimate

- Phase 1: 2 hours
- Phase 2: 4 hours
- Phase 3: 3 hours
- Phase 4: 3 hours
- Phase 5: 4 hours
- Phase 6: 4 hours
- Phase 7: 3 hours
- Phase 8: 2 hours
- Phase 9: 2 hours
- Phase 10: 2 hours

**Total: ~29 hours**

---

## 🤝 Contributing Guidelines

1. Follow TDD: Write tests before implementing features
2. Maintain >80% test coverage
3. Run `npm test` and `npm run lint` before committing
4. Follow TypeScript strict mode
5. Use existing component patterns
6. Add comments only for complex logic
7. Keep commits focused and atomic

---

## 📚 Resources

- [Tauri v2 Documentation](https://v2.tauri.app/)
- [OpenRouter API](https://openrouter.ai/docs)
- [Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [macOS Accessibility API](https://developer.apple.com/documentation/application-services/accessibility_services)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 🆘 Troubleshooting

### Common Issues

**Issue: Hotkey not working**
- Solution: Check Accessibility permissions in System Settings
- Rust: Verify hotkey registration

**Issue: Whisper API errors**
- Solution: Check API key in .env
- Verify audio format (WAV required)

**Issue: Text injection fails**
- Solution: Grant Accessibility permissions
- Fallback to clipboard enabled

**Issue: Audio recording not starting**
- Solution: Grant microphone permissions
- Check Web Audio API support

---

*Last updated: January 2026*
*Version: 1.0.0*
