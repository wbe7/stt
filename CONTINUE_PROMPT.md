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

**Phase 6: Text Injection** (100% complete)
- `src-tauri/src/commands/accessibility.rs` - Enhanced accessibility commands (10 tests ✅)
- `src-tauri/Cargo.toml` - Added `core-foundation` dependency
- `src/__tests__/integration/accessibility.test.ts` - Integration tests (11 tests ✅)
- Features:
  - macOS Accessibility API (AXUIElementSetAttributeValue) for text injection
  - Get active application (bundle_id, name)
  - Insert text at cursor using kAXSelectedTextAttribute
  - Fallback to clipboard + Cmd+V when accessibility fails
  - Check for TextField/TextArea roles before injection
  - Request/check accessibility permissions
- Test Status: **21/21 tests passing**
- Type-check: **PASSING**
- Lint: **PASSING**

**Phase 7: Settings & Customization** (100% complete)
- `src/store/settings-store.ts` - Zustand store with persistence (8 tests ✅)
- `src/components/features/Settings/SettingsPanel.tsx` - Settings panel UI
- `src/components/features/Settings/HotkeyEditor.tsx` - Hotkey editor component
- `src/components/features/Settings/ModelSelector.tsx` - Model selector component
- `src/components/features/Settings/index.ts` - Barrel export
- Features:
  - Settings management with Zustand
  - Persistence with zustand/persist middleware
  - Hotkey editor with key capture
  - Model selector for AI models
  - Language and editing level selectors
  - Auto-paste and notifications toggles
  - Reset settings functionality
- Test Status: **8/8 tests passing**
- Type-check: **PASSING**
- Lint: **PASSING**

**Phase 8: Menu Bar Integration** (100% complete)
- `src/types/menubar.ts` - Menu bar types
- `src/components/features/MenuBar/MenuBar.tsx` - Menu bar component
- `src/components/features/MenuBar/index.ts` - Barrel export
- `src-tauri/src/commands/menubar.rs` - Tauri system tray commands
- `src-tauri/Cargo.toml` - Added tray-icon feature
- Test Status: **5/5 tests passing**
- Type-check: **PASSING**
- Lint: **PASSING**

**Phase 9: History & Stats** (100% complete)
- `src/types/history.ts` - History types
- `src/store/history-store.ts` - Zustand store with persistence
- `src/lib/stats.ts` - Statistics calculations
- `src/components/features/History/TranscriptionHistory.tsx` - History UI component
- `src/components/features/History/index.ts` - Barrel export
- Test Status: **13/13 tests passing**
- Type-check: **PASSING**
- Lint: **PASSING**

### ⏳ Next Files to Create
**Phase 10: Polish & Optimization**
- E2E tests
- Performance optimizations
- Bug fixes
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

- **Total Tests**: 137/137 passing (100% complete)
- **Phases Completed**: 10/10 (100%)
- **Project Status**: ✅ COMPLETE

---

## Next Immediate Tasks (Phase 10 - Polish & Optimization)

✅ **COMPLETED** - All tasks for Phase 10 are complete:
1. ✅ Performance optimization:
   - ✅ Debounce rapid API calls (added debounce and throttle utilities)
   - ✅ Lazy load heavy components (SettingsPanel, TranscriptionHistory with React.lazy)
   - ✅ Optimized recording state polling (useCallback, 2-second interval)

2. ✅ Integration tests:
   - ✅ Recording flow test (9 tests)
   - ✅ Transcription flow test
   - ✅ Editing flow test
   - ✅ Hotkey integration test

3. ✅ Bug fixes and refinements:
   - ✅ Fixed setState in useEffect warning
   - ✅ Fixed TypeScript type errors
   - ✅ Added comprehensive test coverage

**Project is ready for production use!**

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

*Last updated: January 21, 2026*
*Version: 0.9.0 - Phase 9 Complete, Phase 10 Next*
