import React from 'react'
import { Check, ExternalLink, Mic, Settings, Keyboard } from 'lucide-react'
import { invoke } from '@tauri-apps/api/core'

interface Step {
  title: string
  description: string
  content: string
}

const steps: Step[] = [
  {
    title: 'Permission Setup',
    description: 'Grant necessary permissions',
    content: 'interactive'
  },
  {
    title: 'Global Hotkeys',
    description: 'Use hotkeys to record',
    content: 'hotkey-demo'
  },
  {
    title: 'Voice Recording',
    description: 'Record your voice',
    content: 'recording-demo'
  },
  {
    title: 'Text Editing',
    description: 'AI-powered text editing',
    content: 'editing-demo'
  },
  {
    title: 'Settings',
    description: 'Customize your experience',
    content: 'settings-demo'
  }
]

interface OnboardingProps {
  onComplete?: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [demoRecording, setDemoRecording] = React.useState(false)

  const handleOpenSettings = async (type: 'accessibility' | 'microphone') => {
    try {
      await invoke('open_privacy_settings', { settingType: type })
    } catch (error) {
      console.error('Failed to open settings:', error)
    }
  }

  const handleTestRecording = () => {
    setDemoRecording(true)
    setTimeout(() => setDemoRecording(false), 2000) // Simulate 2 second recording
  }

  const complete = () => {
    // Mark onboarding as complete, perhaps set localStorage
    localStorage.setItem('onboardingComplete', 'true')
    // Call onComplete callback if provided
    onComplete?.()
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to Voice Dictation</h1>
          <p className="text-slate-400">Follow these steps to get started with your voice dictation app.</p>
        </div>

        {/* Steps List */}
        <div className="space-y-6 mb-8">
          {steps.map((step, index) => (
            <div key={index} className="rounded-lg border border-slate-700 bg-slate-800 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                  <p className="text-slate-400 mb-2">{step.description}</p>
                  {step.content === 'interactive' ? (
                    <div className="space-y-4">
                      <p className="text-slate-300">Voice Dictation requires microphone and accessibility permissions to function properly.</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700">
                          <div>
                            <h4 className="font-medium">Microphone Permission</h4>
                            <p className="text-sm text-slate-400">Required to record audio for transcription</p>
                          </div>
                          <button
                            onClick={() => handleOpenSettings('microphone')}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                          >
                            <ExternalLink size={16} />
                            Open Settings
                          </button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700">
                          <div>
                            <h4 className="font-medium">Accessibility Permission</h4>
                            <p className="text-sm text-slate-400">Required to inject text into other applications</p>
                          </div>
                          <button
                            onClick={() => handleOpenSettings('accessibility')}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                          >
                            <ExternalLink size={16} />
                            Open Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : step.content === 'hotkey-demo' ? (
                    <div className="space-y-4">
                      <p className="text-slate-300">Press <kbd className="px-2 py-1 bg-slate-600 rounded text-sm">Cmd+Shift+V</kbd> to start recording anywhere. The app will transcribe your speech and inject the text into the active application.</p>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700">
                        <Keyboard size={20} className="text-blue-400" />
                        <div>
                          <p className="font-medium">Default Hotkey</p>
                          <p className="text-sm text-slate-400">Cmd + Shift + V</p>
                        </div>
                      </div>
                    </div>
                  ) : step.content === 'recording-demo' ? (
                    <div className="space-y-4">
                      <p className="text-slate-300">When recording, speak clearly. The app will automatically detect silence and stop recording. You can also press Spacebar to toggle recording.</p>
                      <button
                        onClick={handleTestRecording}
                        disabled={demoRecording}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded-lg transition-colors"
                      >
                        <Mic size={16} />
                        {demoRecording ? 'Recording... (2s)' : 'Try Test Recording'}
                      </button>
                    </div>
                  ) : step.content === 'editing-demo' ? (
                    <div className="space-y-4">
                      <p className="text-slate-300">After transcription, the app automatically edits your text to remove filler words, fix grammar, and adjust tone.</p>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-slate-700">
                          <p className="text-sm text-slate-400 mb-1">Before:</p>
                          <p className="text-sm">"Um, so basically, like, this is a test, you know, for the voice dictation app."</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-900/20 border border-green-700">
                          <p className="text-sm text-green-400 mb-1">After:</p>
                          <p className="text-sm">"This is a test for the voice dictation app."</p>
                        </div>
                      </div>
                    </div>
                  ) : step.content === 'settings-demo' ? (
                    <div className="space-y-4">
                      <p className="text-slate-300">Access settings to change hotkeys, AI models, language, and editing preferences.</p>
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors">
                        <Settings size={16} />
                        Open Settings (Available after setup)
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-300">{step.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Complete Button */}
        <div className="text-center">
          <button
            onClick={complete}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors mx-auto"
          >
            <Check size={20} />
            I've completed the setup
          </button>
        </div>
      </div>
    </div>
  )
}