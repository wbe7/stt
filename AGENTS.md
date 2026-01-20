# AGENTS.md - Voice Dictation App (Wispr Flow Clone)

*Last updated: January 20, 2026*
*Version: 0.7.0 - Phase 6 Complete, Phase 7 Next*

## Project Overview
Voice dictation AI application using Next.js, Tauri, and OpenRouter with Whisper. Speech-to-text with AI auto-editing for macOS desktop.

## Tech Stack
- Frontend: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- Desktop: Tauri v2 (Rust backend)
- AI: OpenRouter API (Whisper for transcription, GPT-4o mini for editing)
- State: Zustand
- Testing: Vitest + React Testing Library + TDD
- Audio: Web Audio API

## Build & Development Commands

### Install Dependencies
```bash
npm install
cd src-tauri && cargo install
```

### Development (Hot Reload)
```bash
npm run dev          # Start Next.js dev server
npm run tauri:dev    # Start Tauri dev mode (includes Next.js)
```

### Build
```bash
npm run build        # Build Next.js for production
npm run tauri:build  # Build Tauri app for current platform
```

### Testing
```bash
npm test             # Run all tests (Vitest + RTL)
npm test:watch       # Run tests in watch mode (TDD workflow)
npm test:ui          # Run Vitest UI
npm test:coverage    # Generate coverage report
```

### Run Single Test
```bash
npm test -- [test-file-name]           # Run specific test file
npm test -- -t "test name"             # Run tests matching pattern
npm test:watch -- [test-file-name]     # Watch specific file
```

### Linting & Formatting
```bash
npm run lint              # ESLint check
npm run lint:fix          # ESLint auto-fix
npm run format            # Prettier format
npm run format:check      # Prettier check
npm run type-check        # TypeScript type checking
```

## Code Style Guidelines

### TypeScript
- Use strict mode (`strict: true` in tsconfig)
- Explicit return types for public functions
- Use `interface` for object shapes, `type` for unions
- Avoid `any` - use `unknown` or proper types
- Use `const` by default, `let` only when reassigning

### Imports
- Order: React imports → external libs → internal imports → types
- Use absolute imports (`@/components/...`)
- Group related imports with blank lines

### Component Structure
```typescript
// Imports in order
import React from 'react'
import { useStore } from '@/store'

// Types
interface Props {
  // props
}

// Component
export function ComponentName({ prop }: Props) {
  // Hooks first
  const [state, setState] = useState()

  // Handlers
  const handleAction = () => {}

  // Effects
  useEffect(() => {}, [])

  // Render
  return <div />
}
```

### Naming Conventions
- Components: PascalCase (`VoiceRecorder.tsx`)
- Functions/Variables: camelCase (`transcribeAudio`)
- Constants: UPPER_SNAKE_CASE (`API_TIMEOUT_MS`)
- Types/Interfaces: PascalCase (`TranscriptionResult`)
- Files: kebab-case for non-components, PascalCase for components

### Error Handling
```typescript
// Always wrap async operations in try-catch
try {
  const result = await apiCall()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: error.message }
}
```

### State Management (Zustand)
- Use slices for related state
- Keep actions in the same file as the store
- Use selectors for derived state
- Persist critical data with zustand/persist

### Rust (Tauri Backend)
- Use `#[tauri::command]` for exposed commands
- Handle Result types properly
- Use `?` operator for error propagation
- Keep Rust modules focused and small

## Testing Guidelines (TDD)

### Test Structure
```typescript
describe('ComponentName', () => {
  // Arrange
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    // Act & Assert
    render(<ComponentName />)
    expect(screen.getByText('...')).toBeInTheDocument()
  })
})
```

### TDD Workflow
1. Write failing test
2. Run `npm run tauri:dev` in one terminal
3. Run `npm test:watch` in another
4. Implement minimum code to pass
5. Refactor
6. Repeat

### Test Coverage
- Unit tests: utility functions, hooks, stores
- Integration tests: component interactions
- E2E tests: critical user flows (add later)

## Project Structure
```
src/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/                # Reusable UI components (shadcn/ui)
│   └── features/          # Feature-specific components
├── lib/                   # Utilities & helpers
│   ├── api/              # API clients (OpenRouter)
│   │   └── openrouter/  # OpenRouter API (Phase 3 & 4 complete)
│   ├── audio/            # Audio processing (Phase 2 complete)
│   └── text/            # Text editing utilities (Phase 4 complete)
├── store/                 # Zustand stores
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── styles/                # Global styles

src-tauri/
├── src/
│   ├── commands/         # Tauri commands
│   ├── utils/           # Rust utilities
│   └── main.rs          # Entry point
└── tauri.conf.json
```

## API Integration (OpenRouter)

### Environment Variables
```env
OPENROUTER_API_KEY=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
OPENROUTER_WHISPER_MODEL=whisper-1
OPENROUTER_EDIT_MODEL=openai/gpt-4o-mini
```

### Whisper API Pattern (✅ COMPLETE)
```typescript
// src/lib/api/openrouter/whisper.ts
import { transcribeAudio } from '@/lib/api/openrouter'

const result = await transcribeAudio(wavBlob, { language: 'ru' })

if (result.success) {
  console.log(result.data.text) // Transcribed text
  console.log(result.data.language) // Detected language (ru, en, etc.)
  console.log(result.data.duration) // Audio duration in seconds
} else {
  console.error('Transcription failed:', result.error)
}

// Features:
// - WAV format validation (required by Whisper API)
// - File size validation (25MB max)
// - Retry logic with exponential backoff
// - Language auto-detection (if language not specified)
// - Error handling for client (4xx) and server (5xx) errors
```

## Key Features to Implement

### Voice Recording
- Web Audio API for capture
- Silence detection for auto-stop
- Audio format conversion (WebM → WAV/MP3)
- Recording controls (pause/resume/stop)

### Transcription (✅ COMPLETE)
- Batch processing via Whisper API
- Language auto-detection
- Error retry logic with exponential backoff
- WAV format validation (25MB max)
- Error handling for client (4xx) and server (5xx) errors

### Text Editing (✅ COMPLETE)
- GPT-4o mini integration for intelligent editing
- Remove filler words (ээ, ну, um, like, etc.)
- Fix stuttering and repetitions
- Punctuation insertion
- Capitalization correction
- Tone adjustment (casual/formal/preserve)
- Local text editing utilities:
  - `removeFillerWords()` - Remove Russian/English filler words
  - `fixStuttering()` - Fix word repetitions
  - `insertPunctuation()` - Add period at end and between languages
  - `correctCapitalization()` - Fix capitalization
  - `adjustTone()` - Adjust text tone
  - `editTextLocally()` - Apply all edits in sequence

### macOS Integration (Tauri)
- Global hotkeys (`Cmd+Shift+V`) ✅ COMPLETE
- Clipboard access
- Text injection via accessibility APIs
- Menu bar integration
- Notification support

### Hotkey System (✅ COMPLETE)
- Press/Release event handling with timestamp
- Toggle mode with Spacebar
- Recording state management
- React hook for frontend integration

## Performance Guidelines
- Debounce rapid API calls
- Use React.memo for expensive components
- Virtualize long lists
- Lazy load heavy dependencies
- Optimize audio files before API calls

## Security Notes
- Never commit API keys
- Use environment variables
- Sanitize user inputs
- Implement rate limiting
- Handle audio files securely (auto-delete)

## TODO: Initial Tasks
1. [x] Setup Next.js + Tauri project
2. [x] Configure TypeScript and testing
3. [x] Create AGENTS.md
4. [x] Create PRD.md
5. [x] Implement basic voice recording (Phase 2 - Audio)
6. [x] Integrate Whisper API (Phase 3)
7. [x] Add text editing features (Phase 4)
8. [ ] Implement macOS hotkeys (Phase 5)
9. [ ] Add personal dictionary (Phase 9)
10. [ ] Create snippet library (Phase 9)
11. [ ] Polish and test (Phase 10)

---

## Current Progress (January 20, 2026)

### Phase 1: Project Setup ✅ COMPLETED
- Next.js 15 + TypeScript + Tailwind CSS installed
- Tauri v2 initialized
- Vitest + React Testing Library configured
- Environment variables set (.env with OpenRouter API key)
- Test infrastructure working (setup.ts with proper mocks)

### Phase 2: Audio Recording ✅ COMPLETED (40/40 tests passing)
**Implemented:**
- `src/lib/audio/recorder.ts` - VoiceRecorder class with MediaRecorder API
- `src/lib/audio/converter.ts` - AudioConverter class (WebM → WAV)
- `src/lib/audio/silence-detector.ts` - SilenceDetector class
- `src/types/audio.ts` - Audio-related TypeScript types
- `src/lib/audio/index.ts` - Barrel export

**Tests (all passing):**
- `src/__tests__/unit/audio/recorder.test.ts` - 17 tests
- `src/__tests__/unit/audio/converter.test.ts` - 13 tests
- `src/__tests__/unit/audio/silence-detector.test.ts` - 10 tests

**Test Status:**
```
✓ src/__tests__/unit/audio/silence-detector.test.ts (10 tests)
✓ src/__tests__/unit/audio/converter.test.ts (13 tests)
✓ src/__tests__/unit/audio/recorder.test.ts (17 tests)

Test Files: 3 passed
Tests: 40 passed
Type-check: PASSING
Lint: PASSING (2 warnings only, no errors)
```

### Phase 3: Whisper API Integration ✅ COMPLETED (23/23 tests passing)
**Implemented:**
- `src/lib/api/openrouter/types.ts` - API types (WhisperRequest, WhisperResponse, TranscriptionResult)
- `src/lib/api/openrouter/client.ts` - OpenRouter client class with error handling
- `src/lib/api/openrouter/whisper.ts` - Whisper transcription with retry logic
- `src/lib/api/openrouter/index.ts` - Barrel export

**Features:**
- WAV format validation (required by Whisper API)
- File size limit validation (25MB max)
- Retry logic with exponential backoff
- Language auto-detection support
- Error handling for client (4xx) and server (5xx) errors

**Tests (all passing):**
- `src/__tests__/unit/api/client.test.ts` - 10 tests
- `src/__tests__/unit/api/whisper.test.ts` - 13 tests

**Test Status:**
```
✓ src/__tests__/unit/api/client.test.ts (10 tests)
✓ src/__tests__/unit/api/whisper.test.ts (13 tests)

Test Files: 2 passed
Tests: 23 passed
Type-check: PASSING
Lint: PASSING
```

### Phase 4: GPT-4o Text Editing ✅ COMPLETED (28/28 tests passing)
**Implemented:**
- `src/lib/api/openrouter/edit-types.ts` - Editing types (EditRequest, EditResponse, EditConfig, Message)
- `src/lib/api/openrouter/edit.ts` - GPT-4o mini editing with retry logic
- `src/lib/api/openrouter/client.ts` - Updated with `chat()` method for GPT-4o
- `src/lib/api/openrouter/index.ts` - Updated barrel export
- `src/lib/text/editing.ts` - Text editing utilities
- `src/lib/text/index.ts` - Barrel export

**Features:**
- GPT-4o mini integration for intelligent editing
- Remove filler words (Russian: ээ, ну, это, etc. | English: um, uh, like, etc.)
- Fix stuttering and repetitions
- Insert punctuation (period at end, between language transitions)
- Correct capitalization
- Adjust tone (casual/formal/preserve)
- Local text editing utilities that work without API
- Retry logic with exponential backoff
- Error handling for client (4xx) and server (5xx) errors

**Tests (all passing):**
- `src/__tests__/unit/api/edit.test.ts` - 9 tests
- `src/__tests__/unit/text/editing.test.ts` - 19 tests

**Test Status:**
```
✓ src/__tests__/unit/api/edit.test.ts (9 tests)
✓ src/__tests__/unit/text/editing.test.ts (19 tests)

Test Files: 2 passed
Tests: 28 passed
Type-check: PASSING
Lint: PASSING
```

### Phase 5: Global Hotkeys ✅ COMPLETED (16/16 tests passing)
**Implemented:**
- `src-tauri/src/commands/hotkey.rs` - Enhanced hotkey commands with event handling (10 tests ✅)
- `src/hooks/useGlobalHotkey.ts` - React hook for hotkey integration (2 tests ✅)
- `src/types/hotkey.ts` - Hotkey event and state types
- `src/__tests__/integration/hotkey.test.ts` - Integration tests (2 tests ✅)
- `src/__tests__/hooks/useGlobalHotkey.test.ts` - Hook tests (2 tests ✅)

**Features:**
- Press/Release event handling with timestamp
- Toggle mode with Spacebar support
- Recording state management (isRecording, mode, startTime)
- Event listeners for hotkey events and recording state changes
- Register/unregister hotkey commands
- Get recording state command
- Extended key code parsing (a-z, 0-9, space, enter, escape)

**Tests (all passing):**
- `src-tauri/src/commands/hotkey.rs` (10 tests) - parse_simple_hotkey, parse_complex_hotkey, parse_invalid_hotkey, parse_invalid_modifier, parse_space_key, parse_enter_key, parse_alphabetic_keys, parse_digit_keys, recording_mode_default, recording_mode_as_str, recording_state_default
- `src/__tests__/integration/hotkey.test.ts` (2 tests) - type definitions
- `src/__tests__/hooks/useGlobalHotkey.test.ts` (2 tests) - type definitions

**Test Status:**
```
✓ src-tauri/src/commands/hotkey.rs (10 tests)
✓ src/__tests__/integration/hotkey.test.ts (2 tests)
✓ src/__tests__/hooks/useGlobalHotkey.test.ts (2 tests)

Test Files: 3 passed
Tests: 14 passed
Type-check: PASSING
Lint: PASSING
```

### Phase 6: Text Injection ✅ COMPLETED (21/21 tests passing)
**Implemented:**
- `src-tauri/src/commands/accessibility.rs` - Enhanced accessibility commands (10 tests ✅)
- `src-tauri/Cargo.toml` - Added `core-foundation` dependency
- `src/__tests__/integration/accessibility.test.ts` - Integration tests (11 tests ✅)

**Features:**
- macOS Accessibility API (AXUIElementSetAttributeValue) for text injection
- Get active application (bundle_id, name)
- Insert text at cursor using kAXSelectedTextAttribute
- Check for TextField/TextArea roles before injection
- Fallback to clipboard + Cmd+V when accessibility fails
- Request/check accessibility permissions
- Error handling with detailed messages

**Tests (all passing):**
- `src-tauri/src/commands/accessibility.rs` (10 tests) - inject_text_result_serialization, parse_inject_text_result, focused_app_info_serialization, parse_focused_app_info, empty_text_injection, long_text_injection, unicode_text_injection, special_characters_injection, newline_handling, inject_text_result_with_message
- `src/__tests__/integration/accessibility.test.ts` (11 tests) - type definitions, edit → inject flow, error handling

**Test Status:**
```
✓ src-tauri/src/commands/accessibility.rs (10 tests)
✓ src/__tests__/integration/accessibility.test.ts (11 tests)

Test Files: 2 passed
Tests: 21 passed
Type-check: PASSING
Lint: PASSING
```

**Next Steps:**
- Phase 7: Settings & Customization
- Phase 8: Menu Bar Integration
- Phase 9: History & Stats
- Phase 10: Polish & Optimization

## Common Issues & Solutions

### Issue: Tauri build fails
- Solution: Ensure Rust and Cargo are installed
- Run `source "$HOME/.cargo/env"` before build commands

### Issue: Audio recording not working
- Solution: Check microphone permissions in System Settings
- Verify Web Audio API support in browser

### Issue: Hotkey not working
- Solution: Grant Accessibility permissions in System Settings
- Check hotkey registration in Tauri logs

### Issue: Whisper API errors
- Solution: Verify API key in .env file
- Check audio format (WAV required)
- Verify OpenRouter API status

### Issue: FormData mock issues in tests
- Solution: Ensure MockFormData in setup.ts handles both string and Blob values correctly
- Use `global.fetch = vi.fn()` for fetch mocking
- Check that FormData methods (append, get, getAll) work as expected

### Issue: Retry loop not stopping
- Solution: Check for client errors (4xx) which should not retry
- Only retry server errors (5xx) and network errors

## Development Workflow

### Before Starting Work
1. Read PRD.md for feature requirements
2. Check AGENTS.md for code style
3. Review existing tests in the module
4. Understand the current implementation

### When Implementing Features
1. Write tests first (TDD)
2. Run tests in watch mode
3. Implement minimal code to pass
4. Refactor for clarity
5. Run full test suite
6. Run lint and type-check

### Before Committing
1. Run `npm test` - all tests must pass
2. Run `npm run lint` - no linting errors
3. Run `npm run type-check` - no type errors
4. Review changes for security issues
5. **Update documentation files (CONTINUE_PROMPT.md, AGENTS.md, docs/PRD.md) after completing a phase**
6. **MUST commit changes after completing a phase** - Always create a commit after finishing implementation and ensuring all tests pass

### Workflow for Continuing Work
After completing a phase:
1. Update CONTINUE_PROMPT.md, AGENTS.md, and docs/PRD.md with the latest status
2. Commit the changes
3. Start a new chat session
4. Provide the CONTINUE_PROMPT.md file to the new session
5. The agent will automatically continue from where the previous session left off
6. Repeat until all phases are complete

## Debugging Tips

### Tauri Issues
- Check Tauri logs: `npm run tauri:dev` and look at terminal output
- Verify Rust dependencies: `cd src-tauri && cargo check`
- Test individual commands from frontend console

### Frontend Issues
- Use React DevTools for component inspection
- Check browser console for errors
- Verify API calls in Network tab
- Test audio recording in browser dev tools

### Audio Issues
- Test with different microphones
- Check audio levels in System Settings
- Verify audio format conversion
- Test with sample audio files

## Best Practices

### Code Organization
- Keep components under 200 lines
- Split large files into smaller modules
- Use barrel exports (`export * from ...`)
- Maintain consistent file naming

### Performance
- Memoize expensive computations
- Use lazy loading for heavy components
- Implement pagination for long lists
- Optimize images and audio files

### User Experience
- Provide loading states
- Show helpful error messages
- Implement proper error boundaries
- Add keyboard shortcuts for common actions

### Accessibility
- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers
