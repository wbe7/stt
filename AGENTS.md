# AGENTS.md - Voice Dictation App (Wispr Flow Clone)

## Project Overview
Voice dictation AI application using Next.js, Tauri, and OpenRouter with Whisper. Speech-to-text with AI auto-editing for macOS desktop.

## Tech Stack
- Frontend: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- Desktop: Tauri v2 (Rust backend)
- AI: OpenAI Whisper via OpenRouter API
- State: Zustand
- Testing: Vitest + React Testing Library + TDD

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
│   ├── ui/                # Reusable UI components
│   └── features/          # Feature-specific components
├── lib/                   # Utilities & helpers
│   ├── api/              # API clients (OpenRouter)
│   └── audio/            # Audio processing
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
OPENROUTER_MODEL=whisper-1
```

### API Client Pattern
```typescript
// src/lib/api/openrouter.ts
export async function transcribeAudio(audioBlob: Blob) {
  const formData = new FormData()
  formData.append('file', audioBlob)
  formData.append('model', 'whisper-1')

  const response = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
    },
    body: formData
  })

  if (!response.ok) throw new Error('Transcription failed')
  return response.json()
}
```

## Key Features to Implement

### Voice Recording
- Web Audio API for capture
- Silence detection for auto-stop
- Audio format conversion (WebM → WAV/MP3)
- Recording controls (pause/resume/stop)

### Transcription
- Real-time streaming (if available)
- Batch processing fallback
- Language auto-detection
- Error retry logic

### Text Editing
- Remove filler words (um, uh, like)
- Fix stuttering and repetitions
- Punctuation insertion
- Capitalization correction
- Tone adjustment (casual/formal)

### macOS Integration (Tauri)
- Global hotkeys (`Cmd+Shift+V`)
- Clipboard access
- Text injection via accessibility APIs
- Menu bar integration
- Notification support

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
6. [ ] Integrate Whisper API (Phase 3)
7. [ ] Add text editing features (Phase 4)
8. [ ] Implement macOS hotkeys (Phase 5)
9. [ ] Add personal dictionary (Phase 9)
10. [ ] Create snippet library (Phase 9)
11. [ ] Polish and test (Phase 10)

---

## Current Progress (January 19, 2026)

### Phase 1: Project Setup ✅ COMPLETED
- Next.js 15 + TypeScript + Tailwind CSS installed
- Tauri v2 initialized
- Vitest + React Testing Library configured
- Environment variables set (.env.local with OpenRouter API key)
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

**Next Steps:**
- Phase 3: Whisper API Integration
- Phase 4: GPT-4o Text Editing
- Phase 5: Global Hotkeys (Rust)
- Phase 6: Text Injection (Rust)
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
5. Update documentation if needed

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
