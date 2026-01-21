import { useState } from 'react'
import type { MenuBarStatus } from '@/types/menubar'

interface Props {
  status?: MenuBarStatus
}

export function MenuBar({ status = 'idle' }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {status === 'recording' ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          )}
        </svg>
      </button>

      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
        {status === 'recording' ? 'Recording' : 'Idle'}
      </span>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50">
          <button
            type="button"
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg"
            onClick={() => setIsOpen(false)}
          >
            Record
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-b-lg text-red-600 dark:text-red-400"
            onClick={() => setIsOpen(false)}
          >
            Quit
          </button>
        </div>
      )}
    </div>
  )
}
