import React, { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import Onboarding from './features/Onboarding/Onboarding'

interface PermissionStatus {
  accessibility: boolean
  microphone: boolean
}

interface PermissionGuardProps {
  children: React.ReactNode
}

export default function PermissionGuard({ children }: PermissionGuardProps) {
  const [permissions, setPermissions] = useState<PermissionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  const checkPermissions = async () => {
    try {
      const perms = await invoke<PermissionStatus>('check_permissions')
      setPermissions(perms)
    } catch (error) {
      console.error('Failed to check permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkPermissions()
    const interval = setInterval(checkPermissions, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Check if onboarding is complete from localStorage
    const complete = localStorage.getItem('onboardingComplete') === 'true'
    setOnboardingComplete(complete)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!permissions || !permissions.accessibility || !permissions.microphone) {
    return <PermissionSetupScreen />
  }

  // Check if onboarding is complete
  if (!onboardingComplete) {
    return <Onboarding onComplete={() => setOnboardingComplete(true)} />
  }

  return <>{children}</>
}

function PermissionSetupScreen() {
  const handleOpenSettings = async (type: 'accessibility' | 'microphone') => {
    try {
      await invoke('open_privacy_settings', { settingType: type })
    } catch (error) {
      console.error('Failed to open settings:', error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Setup Required</h1>
          <p className="text-slate-400">
            Voice Dictation needs permissions to function properly. Please grant the following permissions.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Accessibility Permission</h3>
              <button
                onClick={() => handleOpenSettings('accessibility')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Open Settings
              </button>
            </div>
            <p className="text-slate-400">
              Required to inject transcribed text into other applications. Without this permission,
              text will be copied to clipboard instead.
            </p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Microphone Permission</h3>
              <button
                onClick={() => handleOpenSettings('microphone')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Open Settings
              </button>
            </div>
            <p className="text-slate-400">
              Required to record audio for transcription. The app cannot function without microphone access.
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500">
          <p>Permissions are checked automatically. The app will continue once all permissions are granted.</p>
        </div>
      </div>
    </div>
  )
}