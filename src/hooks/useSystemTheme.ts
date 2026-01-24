import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark'

export function useSystemTheme(): Theme {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateTheme = () => {
      setTheme(mediaQuery.matches ? 'dark' : 'light')
    }

    // Set initial theme
    updateTheme()

    // Listen for changes
    mediaQuery.addEventListener('change', updateTheme)

    return () => {
      mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [])

  return theme
}