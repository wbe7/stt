import { describe, it, expect, vi, beforeEach } from 'vitest'
import { editTextHybrid } from '@/lib/text/hybrid-editing'
import { editTextLocally } from '@/lib/text/editing'
import { editText } from '@/lib/api/openrouter/edit'

// Mock dependencies
vi.mock('@/lib/text/editing', () => ({
  editTextLocally: vi.fn(),
}))

vi.mock('@/lib/api/openrouter/edit', () => ({
  editText: vi.fn(),
}))

describe('editTextHybrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use local processing for basic tasks', async () => {
    const mockLocalResult = 'Cleaned text locally'
    ;(editTextLocally as any).mockReturnValue(mockLocalResult)
    ;(editText as any).mockResolvedValue({ success: false })

    const result = await editTextHybrid('raw text', { editingLevel: 'minimal' })

    expect(editTextLocally).toHaveBeenCalledWith('raw text', expect.any(Object))
    expect(editText).not.toHaveBeenCalled()
    expect(result).toEqual({
      success: true,
      data: { editedText: mockLocalResult },
    })
  })

  it('should use cloud processing for complex operations', async () => {
    const mockCloudResult = { success: true, data: { editedText: 'Enhanced text from cloud' } }
    ;(editTextLocally as any).mockReturnValue('Basic cleaned text')
    ;(editText as any).mockResolvedValue(mockCloudResult)

    const result = await editTextHybrid('complex raw text', { editingLevel: 'aggressive' })

    expect(editTextLocally).toHaveBeenCalledWith('complex raw text', expect.any(Object))
    expect(editText).toHaveBeenCalledWith('Basic cleaned text', expect.any(Object))
    expect(result).toEqual(mockCloudResult)
  })

  it('should fallback to local when cloud fails for complex operations', async () => {
    const mockLocalResult = 'Fallback cleaned text'
    const mockCloudResult = { success: false, error: 'API error' }
    ;(editTextLocally as any).mockReturnValue(mockLocalResult)
    ;(editText as any).mockResolvedValue(mockCloudResult)

    const result = await editTextHybrid('complex raw text', { editingLevel: 'aggressive' })

    expect(editTextLocally).toHaveBeenCalledTimes(2) // Once initially, once as fallback
    expect(editText).toHaveBeenCalledWith(mockLocalResult, expect.any(Object))
    expect(result).toEqual({
      success: true,
      data: { editedText: mockLocalResult },
    })
  })
})