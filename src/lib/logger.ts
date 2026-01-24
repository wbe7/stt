import { invoke } from '@tauri-apps/api/core'

export async function logError(message: string, details?: string): Promise<void> {
  try {
    await invoke('log_error', { message, details })
  } catch (error) {
    // Fallback to console if Tauri invoke fails
    console.error('Failed to log error:', message, details, error)
  }
}