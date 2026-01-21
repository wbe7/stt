import { useState, useMemo } from 'react'
import { useHistoryStore } from '@/store/history-store'
import { Search, Copy, Trash2 } from 'lucide-react'

export function TranscriptionHistory() {
  const { entries, removeEntry } = useHistoryStore()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return entries
    const query = searchQuery.toLowerCase()
    return entries.filter(
      (entry) =>
        entry.originalText.toLowerCase().includes(query) ||
        entry.editedText.toLowerCase().includes(query),
    )
  }, [entries, searchQuery])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const handleDelete = (id: string) => {
    removeEntry(id)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          {entries.length === 0 ? 'No recording history yet' : 'No matching entries found'}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">
                    {formatDate(entry.timestamp)} · {formatDuration(entry.duration)} · {entry.language}
                  </div>
                  <div className="text-gray-900">{entry.editedText || entry.originalText}</div>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => handleCopy(entry.editedText || entry.originalText)}
                    className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                    title="Copy"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {entry.status !== 'completed' && (
                <div className="text-sm text-gray-500 mt-1">
                  Status: {entry.status}
                  {entry.error && ` - ${entry.error}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
