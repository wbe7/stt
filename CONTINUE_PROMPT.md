# Prompt for Continuing Work - Voice Dictation App (Wispr Flow Clone)

## Context
Building a voice dictation AI application that turns speech into polished text with intelligent editing. Target platform: macOS desktop using Tauri v2 + Next.js 15.

## Current Status (January 19, 2026)

### ✅ COMPLETED PHASES

**Phase 1: Project Setup** (100% complete)
- Next.js 15 + TypeScript + Tailwind CSS installed
- Tauri v2 initialized with Rust backend
- Vitest + React Testing Library configured
- Environment variables configured (.env.local with OpenRouter API key)
- Test infrastructure working with comprehensive browser API mocks

**Phase 2: Audio Recording** (100% complete)
- `src/lib/audio/recorder.ts` - VoiceRecorder class (17 tests ✅)
- `src/lib/audio/converter.ts` - AudioConverter class (13 tests ✅)
- `src/lib/audio/silence-detector.ts` - SilenceDetector class (10 tests ✅)
- `src/types/audio.ts` - Audio types defined
- Test Status: **40/40 tests passing**
- Type-check: **PASSING**
- Lint: **PASSING**

### 🔄 NEXT PHASE TO IMPLEMENT

**Phase 3: Whisper API Integration**
- OpenRouter API client for Whisper transcription
- Error handling and retry logic
- Audio format validation (WAV required by Whisper)
- Language auto-detection support (Russian + English terms)

### ⏳ REMAINING PHASES (Not Started)
1. **Phase 4: GPT-4o Editing** - Intelligent text editing (filler word removal, stuttering fix)
2. **Phase 5: Global Hotkeys** - Tauri commands for Cmd+Shift+V (Rust)
3. **Phase 6: Text Injection** - macOS Accessibility API for text insertion (Rust)
4. **Phase 7: Settings & Customization** - Zustand store + UI components
5. **Phase 8: Menu Bar** - macOS menu bar integration
6. **Phase 9: History & Stats** - Local storage + statistics
7. **Phase 10: Polish & Optimization** - Performance + E2E tests

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

### Phase 3: Whisper API Integration (NEXT)
1. Create `src/lib/api/openrouter/client.ts` - OpenRouter API client
2. Create `src/lib/api/openrouter/whisper.ts` - Whisper transcription function
3. Create `src/lib/api/openrouter/types.ts` - API types
4. Create `src/lib/api/openrouter/index.ts` - Barrel export
5. Write unit tests for Whisper API
6. Test with actual audio files (converted from Phase 2)

### Future Phases Overview
- **Phase 4**: GPT-4o mini for intelligent text editing (remove filler words, fix stuttering)
- **Phase 5-6**: Rust Tauri commands for macOS integration
- **Phase 7-9**: UI components with shadcn/ui

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

### OpenRouter Whisper API
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
5. Update documentation if needed

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
│   └── audio/            # Audio processing (Phase 2 complete)
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
- `src/lib/audio/recorder.ts` - VoiceRecorder class
- `src/lib/audio/converter.ts` - AudioConverter class
- `src/lib/audio/silence-detector.ts` - SilenceDetector class
- `src/types/audio.ts` - Audio types
- `src/lib/audio/index.ts` - Barrel export
- `src/__tests__/setup.ts` - Test setup with mocks
- `src/__tests__/unit/audio/recorder.test.ts` - 17 tests
- `src/__tests__/unit/audio/converter.test.ts` - 13 tests
- `src/__tests__/unit/audio/silence-detector.test.ts` - 10 tests

### ⏳ Next Files to Create
- `src/lib/api/openrouter/client.ts` - OpenRouter API client
- `src/lib/api/openrouter/whisper.ts` - Whisper transcription
- `src/lib/api/openrouter/types.ts` - API types
- `src/lib/api/openrouter/index.ts` - Barrel export
- `src/__tests__/unit/api/whisper.test.ts` - Whisper tests
- `src/__tests__/unit/api/client.test.ts` - Client tests

---

## Important Notes

1. **TDD Approach**: Always write tests first, then implement
2. **Type Safety**: Maintain TypeScript strict mode, fix all type errors
3. **Test Coverage**: Aim for >80% test coverage
4. **API Key**: Already configured in `.env.local`, do NOT commit
5. **Audio Format**: Phase 2 outputs WAV, which is compatible with Whisper API
6. **Error Handling**: Always wrap async operations in try-catch
7. **Documentation**: Update PRD.md and AGENTS.md as features are completed

---

## Progress Tracking

- **Total Tests**: 40/126 passing (32% complete)
- **Phases Completed**: 2/10 (20%)
- **Estimated Time Remaining**: ~23 hours

---

## Next Immediate Tasks (Phase 3)

1. Create `src/lib/api/openrouter/types.ts` with:
   - TranscriptionRequest interface
   - TranscriptionResponse interface
   - WhisperConfig interface

2. Create `src/lib/api/openrouter/client.ts` with:
   - OpenRouter client class
   - HTTP request helper
   - Error handling

3. Create `src/lib/api/openrouter/whisper.ts` with:
   - `transcribeAudio()` function
   - WAV format validation
   - Retry logic

4. Create `src/lib/api/openrouter/index.ts` barrel export

5. Write tests:
   - `src/__tests__/unit/api/whisper.test.ts` (10 tests)
   - `src/__tests__/unit/api/client.test.ts` (7 tests)

---

## Common Issues & Solutions

### Issue: API calls failing
- Solution: Verify API key in .env.local, check OpenRouter status

### Issue: Audio format rejected
- Solution: Ensure AudioConverter outputs WAV, check file size (<25MB)

### Issue: TypeScript errors
- Solution: Run `npm run type-check`, fix all errors before committing

### Issue: Tests failing
- Solution: Run `npm test:watch`, check test setup in `setup.ts`

---

*Last updated: January 19, 2026*
*Version: 0.3.0 - Phase 2 Complete, Phase 3 Next*
