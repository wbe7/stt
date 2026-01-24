import CryptoJS from 'crypto-js';

// Fixed secret key - in production, this should be derived from user-specific data or hardware
const SECRET_KEY = 'voice-dictation-app-secure-key-2026';

export const secureStorage = {
  getItem: (name: string): any => {
    try {
      const encrypted = localStorage.getItem(name);
      if (!encrypted) return null;

      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Failed to decrypt stored data:', error);
      return null;
    }
  },

  setItem: (name: string, value: any): void => {
    try {
      const stringified = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(stringified, SECRET_KEY).toString();
      localStorage.setItem(name, encrypted);
    } catch (error) {
      console.error('Failed to encrypt data for storage:', error);
    }
  },

  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};