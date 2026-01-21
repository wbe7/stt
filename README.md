# Voice Dictation - AI-powered speech-to-text for macOS

Turn your speech into polished text with intelligent AI editing. Remove filler words, fix stuttering, and get clean text instantly.

![Voice Dictation](https://img.shields.io/badge/version-0.1.0-blue)
![macOS](https://img.shields.io/badge/platform-macOS-lightgrey)
![Tests](https://img.shields.io/badge/tests-137%20passing-brightgreen)

## 🌟 Features

- **Voice Recording** - High-quality audio capture using Web Audio API
- **AI Transcription** - Powered by OpenRouter Whisper API
- **Smart Editing** - GPT-4o mini removes filler words and fixes stuttering
- **Global Hotkeys** - Use Cmd+Shift+V anywhere on macOS
- **Text Injection** - Automatically inserts text into active applications
- **Bilingual Support** - Works with Russian and English
- **History & Stats** - Track all your recordings
- **Custom Settings** - Configure hotkeys, models, and editing levels

## 📋 Requirements

- **macOS** (11.0 or later)
- **Node.js** 18+ (for development only)
- **Rust & Cargo** (for building)
- **OpenRouter API key** - Get one at [openrouter.ai](https://openrouter.ai/keys)

## 🚀 Installation

### Option 1: Download from GitHub Releases (Recommended for non-developers)

1. Download latest `.dmg` file from [Releases](../../releases)
2. Open `.dmg` file
3. Drag **Voice Dictation** to your **Applications** folder
4. Launch app from Applications or Spotlight

### Option 2: Build from Source (For developers)

```bash
# Clone repository
git clone git@github.com:wbe7/stt.git
cd stt

# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Install dependencies
npm install

# Build application
npm run tauri:build
```

The built app will be in `src-tauri/target/release/bundle/dmg/`

## 🔧 Setup

### 1. Get OpenRouter API Key

1. Visit [openrouter.ai](https://openrouter.ai/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-or-v1-`)

### 2. Configure Application

1. Open **Voice Dictation**
2. Click **Settings** in navigation
3. Scroll to **API ключ OpenRouter**
4. Paste your API key
5. Optionally customize:
   - **Горячие клавиши** - Change recording hotkeys (default: Cmd+Shift+V)
   - **Язык** - Choose Russian or English
   - **Уровень редактирования** - Minimal, Medium, or Aggressive
   - **Модель редактирования** - Choose AI model (GPT-4o Mini recommended)

### 3. Grant Permissions

For app to work correctly, you need to grant these permissions:

#### Accessibility (Required)

1. Open **System Settings** → **Privacy & Security** → **Accessibility**
2. Find **Voice Dictation** in list
3. Toggle switch to **ON**

*Why?* The app needs Accessibility permissions to insert text into other applications.

#### Microphone (Required)

1. When you first try to record, you'll be prompted
2. Click **Allow** to grant microphone access

*Why?* The app needs microphone access to record your voice.

## 🎯 How to Use

### Basic Recording

1. **Hold** hotkey combination (default: `Cmd + Shift + V`)
2. Speak into your microphone
3. **Release** keys to stop recording
4. The app will:
   - Transcribe your speech using Whisper AI
   - Edit text using GPT-4o
   - Insert polished text into your active application

### Toggle Mode

1. **Press** `Cmd + Shift + Space` to toggle recording on/off
2. Start speaking
3. **Press** again to stop
4. Text will be processed and inserted automatically

### Viewing History

1. Open **Voice Dictation**
2. Click **History** in navigation
3. View all your past recordings
4. Search by keyword or copy text to clipboard
5. Delete entries you don't need

### Checking Statistics

1. Open **History**
2. View statistics at top:
   - Total recordings
   - Total duration
   - Total words
   - Language breakdown
   - Status breakdown

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|---------|----------|
| Start/Stop Recording | `Cmd + Shift + V` (hold) |
| Toggle Recording | `Cmd + Shift + Space` |
| Open Settings | App menu → Settings |
| View History | App menu → History |
| Quit | `Cmd + Q` |

## 🔍 Troubleshooting

### Recording doesn't work

**Problem:** Pressing hotkey doesn't start recording.

**Solution:**
1. Check that **Accessibility** permission is granted
2. Restart application
3. Try using **Toggle Mode** (`Cmd + Shift + Space`)

### Text doesn't insert

**Problem:** Text appears in app but not in your active application.

**Solution:**
1. Verify **Accessibility** permission is enabled
2. Make sure you have a text cursor in target app
3. Try manually copying from History and pasting

### Transcription fails

**Problem:** "Transcription failed" error message.

**Solution:**
1. Check your API key in Settings
2. Verify you have an active internet connection
3. Check OpenRouter status at [status.openrouter.ai](https://status.openrouter.ai)
4. Ensure audio file size is under 25MB

### Build fails

**Problem:** `npm run tauri:build` fails.

**Solution:**
1. Ensure Rust and Cargo are installed:
   ```bash
   rustc --version
   cargo --version
   ```
2. If not, install Rust:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source "$HOME/.cargo/env"
   ```
3. Update npm dependencies:
   ```bash
   npm install
   ```

## 🧪 Development

### Prerequisites

```bash
# Install Node.js 18+
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
```

### Running in Development Mode

```bash
# Install dependencies
npm install

# Start Tauri dev server (includes Vite)
npm run tauri:dev
```

This will:
- Start Vite dev server on http://localhost:3000
- Launch Tauri app with hot reload
- Show dev tools in app

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with UI
npm test:ui

# Run coverage report
npm test:coverage
```

### Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Run TypeScript type check
npm run type-check
```

### Build for Production

```bash
# Build Tauri app for current platform
npm run tauri:build
```

The output will be in `src-tauri/target/release/bundle/`.

## 📁 Project Structure

```
stt/
├── src/
│   ├── components/              # React components
│   │   ├── features/          # Feature-specific components
│   │   │   ├── History/      # Recording history
│   │   │   ├── Settings/     # Settings panel
│   │   │   └── MenuBar/      # Menu bar
│   │   └── ui/               # Reusable UI components
│   ├── lib/                   # Utilities & helpers
│   │   ├── api/             # API clients (OpenRouter)
│   │   ├── audio/            # Audio processing
│   │   └── text/            # Text editing
│   ├── store/                 # Zustand state management
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   ├── main.tsx               # React entry point
│   └── __tests__/            # Test files
├── src-tauri/                 # Rust backend (Tauri)
│   ├── src/
│   │   ├── commands/         # Tauri commands
│   │   └── main.rs          # Entry point
│   └── tauri.conf.json      # Tauri configuration
├── index.html                 # HTML entry point
├── vite.config.ts            # Vite configuration
├── package.json              # Node.js dependencies
└── tsconfig.json             # TypeScript configuration
```

## 🔒 Security

- API keys are stored locally on your Mac
- Audio files are automatically deleted after processing
- No recordings are uploaded to external servers (except to OpenRouter API for transcription)
- Accessibility permissions are required for text injection only

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](../../issues)
- Check existing [documentation](AGENTS.md)

## 🛠 Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Desktop:** Tauri v2 (Rust)
- **AI:** OpenRouter API (Whisper + GPT-4o Mini)
- **State:** Zustand
- **Testing:** Vitest + React Testing Library

## 🎉 Acknowledgments

- [OpenRouter](https://openrouter.ai) - AI API platform
- [Whisper](https://openai.com/research/whisper) - Speech recognition
- [GPT-4o](https://openai.com/gpt-4o) - Text editing
- [Tauri](https://tauri.app) - Desktop app framework
- [Vite](https://vitejs.dev) - Build tool
- [React](https://reactjs.org) - UI library

---

**Made with ❤️ for macOS users**
