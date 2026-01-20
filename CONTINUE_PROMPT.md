# Prompt for Continuing Work - Voice Dictation App (Wispr Flow Clone)

## Context
Building a voice dictation AI application that turns speech into polished text with intelligent editing. Target platform: macOS desktop using Tauri v2 + Next.js 15.

## Current Status (January 20, 2026)

### ✅ COMPLETED PHASES

**Phase 1: Project Setup** (100% complete)
- Next.js 15 + TypeScript + Tailwind CSS installed
- Tauri v2 initialized with Rust backend
- Vitest + React Testing Library configured
- Environment variables configured (.env with OpenRouter API key)
- Test infrastructure working with comprehensive browser API mocks

**Phase 2: Audio Recording** (100% complete)
- `src/lib/audio/recorder.ts` - VoiceRecorder class (17 tests ✅)
- `src/lib/audio/converter.ts` - AudioConverter class (13 tests ✅)
- `src/lib/audio/silence-detector.ts` - SilenceDetector class (10 tests ✅)
- `src/types/audio.ts` - Audio types defined
- Test Status: **40/40 tests passing**
- Type-check: **PASSING**
- Lint: **PASSING**

**Phase 3: Whisper API Integration** (100% complete)
- `src/lib/api/openrouter/client.ts` - OpenRouter API client (10 tests ✅)
- `src/lib/api/openrouter/whisper.ts` - Whisper transcription with retry (13 tests ✅)
- `src/lib/api/openrouter/types.ts` - API types
- `src/lib/api/openrouter/index.ts` - Barrel export
- WAV format validation (25MB max)
- Retry logic with exponential backoff
- Language auto-detection support
- Test Status: **23/23 tests passing**
- Type-check: **PASSING**
- Lint: **PASSING**

**Phase 4: GPT-4o Editing** (100% complete)
- `src/lib/api/openrouter/edit-types.ts` - Editing types
- `src/lib/api/openrouter/edit.ts` - GPT-4o mini editing with retry logic (9 tests ✅)
- `src/lib/api/openrouter/client.ts` - Updated with `chat()` method for GPT-4o
- `src/lib/text/editing.ts` - Text editing utilities (19 tests ✅)
- `src/lib/text/index.ts` - Barrel export
- Features: Remove filler words, fix stuttering, insert punctuation, correct capitalization, adjust tone
- Test Status: **28/28 tests passing**
- Type-check: **PASSING**
- Lint: **PASSING**

**Phase 5: Global Hotkeys** (100% complete)
- `src-tauri/src/commands/hotkey.rs` - Enhanced hotkey commands with press/release events (10 tests ✅)
- `src/hooks/useGlobalHotkey.ts` - React hook for hotkey integration (2 tests ✅)
- `src/types/hotkey.ts` - Hotkey event and state types
- `src/__tests__/integration/hotkey.test.ts` - Integration tests (2 tests ✅)
- `src/__tests__/hooks/useGlobalHotkey.test.ts` - Hook tests (2 tests ✅)
- Features: Register/unregister hotkeys, toggle mode with Spacebar, recording state management, event listeners
- Test Status: **16/16 tests passing**
- Type-check: **PASSING**
- Lint: **PASSING**

### 🔄 NEXT PHASE TO IMPLEMENT

**Phase 6: Text Injection** (Rust)
- macOS Accessibility API (AXUIElementSetAttributeValue)
- Get active application
- Insert text at cursor
- Fallback: Clipboard + Cmd+V
- Rust tests for accessibility

### ⏳ REMAINING PHASES (Not Started)
1. **Phase 6: Text Injection** - macOS Accessibility API for text insertion (Rust)
2. **Phase 7: Settings & Customization** - Zustand store + UI components
3. **Phase 8: Menu Bar** - macOS menu bar integration
4. **Phase 9: History & Stats** - Local storage + statistics
5. **Phase 10: Polish & Optimization** - Performance + E2E tests

---

## Tech Stack
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Desktop**: Tauri v2 (Rust backend)
- **AI**: OpenRouter API (Whisper for transcription, GPT-4o mini for editing)
- **State**: Zustand
- **Testing**: Vitest + React Testing Library + TDD workflow
- **Audio**: Web Audio API

---

## Environment Variables
```env
# OpenRouter API
OPENROUTER_API_KEY=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

# Default Models
DEFAULT_WHISPER_MODEL=whisper-1
DEFAULT_EDIT_MODEL=openai/gpt-4o-mini
```

---

## Key Requirements

### Phase 6: Text Injection (NEXT - Rust)
1. macOS Accessibility API (AXUIElementSetAttributeValue)
2. Get active application
3. Insert text at cursor
4. Fallback: Clipboard + Cmd+V
5. Rust tests for accessibility

### Future Phases Overview
- **Phase 6**: Rust Tauri commands for macOS integration (text injection)
- **Phase 7-9**: UI components with shadcn/ui (settings, menu bar, history)

---

## TDD Workflow
1. Write failing test first
2. Run `npm run tauri:dev` in one terminal
3. Run `npm test:watch` in another
4. Implement minimum code to pass
5. Refactor for clarity
6. Repeat

---

## Important: Before Starting Work

1. Read `/Users/mtik/go/src/github.com/wbe7/stt/docs/PRD.md` for detailed requirements
2. Read `/Users/mtik/go/src/github.com/wbe7/stt/AGENTS.md` for code style guidelines
3. Review existing tests in `src/__tests__/unit/audio/` to understand test patterns
4. Understand current implementation in `src/lib/audio/`

---

## Commands to Run

```bash
# Install dependencies (if needed)
npm install
cd src-tauri && cargo install

# Development
npm run dev          # Start Next.js dev server
npm run tauri:dev    # Start Tauri dev mode (includes Next.js)

# Testing
npm test             # Run all tests
npm test:watch       # Run tests in watch mode (TDD)
npm test -- [file]    # Run specific test file

# Quality checks
npm run type-check    # TypeScript type checking
npm run lint          # ESLint check

# Build
npm run build         # Build Next.js
npm run tauri:build  # Build Tauri app
```

---

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
// Imports
import React from 'react'
import { useStore } from '@/store'

// Types
interface Props { }

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

### Error Handling
```typescript
try {
  const result = await apiCall()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: error.message }
}
```

---

## API Integration Notes

### OpenRouter Whisper API (✅ COMPLETE)
```typescript
// Endpoint: https://openrouter.ai/api/v1/audio/transcriptions
// Method: POST
// Content-Type: multipart/form-data
// Headers:
//   Authorization: Bearer ${OPENROUTER_API_KEY}
// Body:
//   file: <WAV audio blob>
//   model: whisper-1
//   language: <optional, auto-detect if omitted>

// Usage:
import { transcribeAudio } from '@/lib/api/openrouter'

const result = await transcribeAudio(wavBlob, { language: 'ru' })
if (result.success) {
  console.log(result.data.text) // Transcribed text
  console.log(result.data.language) // Detected language
}

// Features:
// - WAV format validation (required by Whisper API)
// - File size validation (25MB max)
// - Retry logic with exponential backoff
// - Language auto-detection (if language not specified)
// - Error handling for client (4xx) and server (5xx) errors
```

### OpenRouter GPT-4o Mini (✅ COMPLETE)
```typescript
// Endpoint: https://openrouter.ai/api/v1/chat/completions
// Method: POST
// Content-Type: application/json
// Headers:
//   Authorization: Bearer ${OPENROUTER_API_KEY}
// Body:
//   model: openai/gpt-4o-mini
//   messages: [{ role: "user", content: "Edit this text..." }]

// Usage:
import { editText } from '@/lib/api/openrouter'

const result = await editText('ээ это надо сделать', { mode: 'medium', tone: 'preserve' })
if (result.success) {
  console.log(result.data.editedText) // Edited text
}

// Features:
// - Intelligent text editing with GPT-4o mini
// - Remove filler words (ээ, ну, um, like, etc.)
// - Fix stuttering and repetitions
// - Insert proper punctuation
// - Correct capitalization
// - Adjust tone (casual/formal/preserve)
// - Retry logic with exponential backoff
// - Error handling for client (4xx) and server (5xx) errors
```

### Audio Format Requirements
- Whisper API accepts: WAV, MP3, M4A, OGG
- Our Phase 2 output: WAV (from AudioConverter)
- Max file size: 25MB

---

## Before Committing

1. Run `npm test` - all tests must pass
2. Run `npm run lint` - no linting errors
3. Run `npm run type-check` - no type errors
4. Review changes for security issues
5. **Update documentation files (CONTINUE_PROMPT.md, AGENTS.md, docs/PRD.md) after completing a phase**
6. **MUST commit changes after completing a phase** - Always create a commit after finishing implementation and ensuring all tests pass

## Important: Workflow for Continuing Work

After completing a phase:
1. Update CONTINUE_PROMPT.md, AGENTS.md, and docs/PRD.md with the latest status
2. Commit the changes
3. Start a new chat session
4. Provide the CONTINUE_PROMPT.md file to the new session
5. The agent will automatically continue from where the previous session left off
6. Repeat until all phases are complete

---

## Project Structure
```
src/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/                # Reusable UI components (shadcn/ui)
│   └── features/          # Feature-specific components
├── lib/                   # Utilities & helpers
│   ├── api/              # API clients (OpenRouter)
│   │   └── openrouter/  # OpenRouter API (Phase 3 complete)
│   ├── audio/            # Audio processing (Phase 2 complete)
│   └── text/            # Text editing utilities (Phase 4 next)
├── store/                 # Zustand stores
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── __tests__/             # Tests
```

---

## Testing Guidelines

### Test Structure
```typescript
describe('ModuleName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = functionUnderTest(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

---

## Current File Status

### ✅ Completed Files
**Phase 1:**
- `package.json` - Dependencies configured
- `tsconfig.json` - TypeScript strict mode
- `vitest.config.ts` - Test configuration
- `.env` - OpenRouter API key

**Phase 2: Audio Recording**
- `src/lib/audio/recorder.ts` - VoiceRecorder class
- `src/lib/audio/converter.ts` - AudioConverter class
- `src/lib/audio/silence-detector.ts` - SilenceDetector class
- `src/types/audio.ts` - Audio types
- `src/lib/audio/index.ts` - Barrel export
- `src/__tests__/setup.ts` - Test setup with mocks (Blob, FormData, MediaRecorder)
- `src/__tests__/unit/audio/recorder.test.ts` - 17 tests
- `src/__tests__/unit/audio/converter.test.ts` - 13 tests
- `src/__tests__/unit/audio/silence-detector.test.ts` - 10 tests

**Phase 3: Whisper API Integration**
- `src/lib/api/openrouter/client.ts` - OpenRouter API client
- `src/lib/api/openrouter/whisper.ts` - Whisper transcription with retry logic
- `src/lib/api/openrouter/types.ts` - API types (WhisperRequest, WhisperResponse, TranscriptionResult)
- `src/lib/api/openrouter/index.ts` - Barrel export
- `src/__tests__/unit/api/client.test.ts` - 10 tests
- `src/__tests__/unit/api/whisper.test.ts` - 13 tests

**Phase 4: GPT-4o Editing**
- `src/lib/api/openrouter/edit-types.ts` - Editing types (EditRequest, EditResponse, EditConfig, Message)
- `src/lib/api/openrouter/edit.ts` - GPT-4o mini editing with retry logic
- `src/lib/api/openrouter/client.ts` - Updated with `chat()` method
- `src/lib/api/openrouter/index.ts` - Updated barrel export
- `src/lib/text/editing.ts` - Text editing utilities (removeFillerWords, fixStuttering, insertPunctuation, correctCapitalization, adjustTone, editTextLocally)
- `src/lib/text/index.ts` - Barrel export
- `src/__tests__/unit/api/edit.test.ts` - 9 tests
- `src/__tests__/unit/text/editing.test.ts` - 19 tests

### ⏳ Next Files to Create
**Phase 5: Global Hotkeys (Rust)**
- `src-tauri/src/commands/hotkey.rs` - Tauri global hotkey commands
- `src-tauri/src/utils/hotkey_parser.rs` - Hotkey string parsing utility
- `src-tauri/src/tests/hotkey.test.rs` - Rust tests for hotkey module
- Integration tests for hotkey → recording flow

---

## Important Notes

1. **TDD Approach**: Always write tests first, then implement
2. **Type Safety**: Maintain TypeScript strict mode, fix all type errors
3. **Test Coverage**: Aim for >80% test coverage
4. **API Key**: Already configured in `.env.local`, do NOT commit
5. **Audio Format**: Phase 2 outputs WAV, which is compatible with Whisper API
6. **Error Handling**: Always wrap async operations in try-catch
7. **Documentation**: Update PRD.md and AGENTS.md as features are completed
8. **Context7 MCP**: Always use context7 MCP for all libraries - use `codesearch` or `context7_query-docs` tools before implementing any library-specific code

---

## Progress Tracking

- **Total Tests**: 107/126 passing (85% complete)
- **Phases Completed**: 5/10 (50%)
- **Estimated Time Remaining**: ~8 hours

---

## Next Immediate Tasks (Phase 6 - Text Injection)

1. Create `src-tauri/src/commands/accessibility.rs`:
   - macOS Accessibility API (AXUIElementSetAttributeValue)
   - Get active application
   - Insert text at cursor

2. Create `src-tauri/src/utils/mac_accessibility.rs`:
   - macOS accessibility utilities
   - AXUIElement helpers

3. Write Rust tests in `src-tauri/src/tests/accessibility.test.rs` (6 tests):
   - Get focused app
   - Text injection
   - Error handling
   - Clipboard fallback

4. Integration tests (4 tests):
   - Edit → inject flow
   - Accessibility error handling

---

## Common Issues & Solutions

### Issue: Whisper API calls failing
- Solution: Verify API key in .env.local, check OpenRouter status, ensure audio is WAV format

### Issue: Audio format rejected
- Solution: Ensure AudioConverter outputs WAV, check file size (<25MB)

### Issue: Retry loop not stopping
- Solution: Check for client errors (4xx) which should not retry, only retry server errors (5xx)

### Issue: FormData mock issues in tests
- Solution: Ensure MockFormData in setup.ts handles both string and Blob values correctly

### Issue: TypeScript errors
- Solution: Run `npm run type-check`, fix all errors before committing

### Issue: Tests failing
- Solution: Run `npm test:watch`, check test setup in `setup.ts`

---

*Last updated: January 20, 2026*
*Version: 0.6.0 - Phase 5 Complete, Phase 6 Next*
