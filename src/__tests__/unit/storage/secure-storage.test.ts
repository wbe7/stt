import { describe, it, expect, beforeEach, vi } from 'vitest'
import { secureStorage } from '@/lib/storage/secure-storage'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('secureStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should encrypt data when setting item', () => {
    const testData = { message: 'sensitive data' }
    secureStorage.setItem('test', testData)

    expect(localStorageMock.setItem).toHaveBeenCalledWith('test', expect.any(String))
    const encryptedValue = localStorageMock.setItem.mock.calls[0][1]
    // Encrypted value should not be plain JSON
    expect(encryptedValue).not.toBe(JSON.stringify(testData))
    expect(encryptedValue).not.toContain('sensitive data')
  })

  it('should decrypt data when getting item', () => {
    const testData = { message: 'sensitive data' }
    // First set it
    secureStorage.setItem('test', testData)
    const encryptedValue = localStorageMock.setItem.mock.calls[0][1]

    // Mock getItem to return encrypted
    localStorageMock.getItem.mockReturnValue(encryptedValue)

    const result = secureStorage.getItem('test')
    expect(result).toEqual(testData)
  })

  it('should return null when no item exists', () => {
    localStorageMock.getItem.mockReturnValue(null)
    const result = secureStorage.getItem('nonexistent')
    expect(result).toBeNull()
  })

  it('should handle decryption errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-encrypted-data')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const result = secureStorage.getItem('test')
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Failed to decrypt stored data:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('should call removeItem on localStorage', () => {
    secureStorage.removeItem('test')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test')
  })
})