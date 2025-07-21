import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple in-memory storage for development
// In a real app, you'd use AsyncStorage or secure storage

// In-memory storage
const memoryStorage: { [key: string]: string } = {};

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  GOOGLE_ACCESS_TOKEN: 'googleAccessToken',
  USER_DATA: 'userData',
};

// Get stored token
export const getToken = async (): Promise<string | null> => {
  try {
    // Try AsyncStorage first, then fallback to memory storage
    let token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      token = memoryStorage[STORAGE_KEYS.AUTH_TOKEN] || null;
    }
    console.log('[storage] getToken called, token present:', !!token, 'length:', token?.length || 0);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    // Fallback to memory storage
    const token = memoryStorage[STORAGE_KEYS.AUTH_TOKEN] || null;
    console.log('[storage] getToken fallback, token present:', !!token, 'length:', token?.length || 0);
    return token;
  }
};

// Set stored token
export const setToken = async (token: string): Promise<void> => {
  try {
    console.log('[storage] setToken called with token length:', token?.length || 0);
    // Save to both AsyncStorage and memory storage
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    memoryStorage[STORAGE_KEYS.AUTH_TOKEN] = token;
    console.log('[storage] Token saved successfully to both AsyncStorage and memory');
  } catch (error) {
    console.error('Error setting token:', error);
    // Fallback to memory storage only
    memoryStorage[STORAGE_KEYS.AUTH_TOKEN] = token;
    console.log('[storage] Token saved to memory storage only');
  }
};

// Clear stored token
export const clearToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    delete memoryStorage[STORAGE_KEYS.AUTH_TOKEN];
    console.log('[storage] Token cleared from both AsyncStorage and memory');
  } catch (error) {
    console.error('Error clearing token:', error);
    // Fallback to memory storage only
    delete memoryStorage[STORAGE_KEYS.AUTH_TOKEN];
    console.log('[storage] Token cleared from memory storage only');
  }
};

// Get Google access token
export const getGoogleAccessToken = async (): Promise<string | null> => {
  try {
    return memoryStorage[STORAGE_KEYS.GOOGLE_ACCESS_TOKEN] || null;
  } catch (error) {
    console.error('Error getting Google token:', error);
    return null;
  }
};

// Set Google access token
export const setGoogleAccessToken = async (token: string): Promise<void> => {
  try {
    memoryStorage[STORAGE_KEYS.GOOGLE_ACCESS_TOKEN] = token;
  } catch (error) {
    console.error('Error setting Google token:', error);
  }
};

// Get user data
export const getUserData = async (): Promise<any | null> => {
  try {
    const data = memoryStorage[STORAGE_KEYS.USER_DATA];
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Set user data
export const setUserData = async (userData: any): Promise<void> => {
  try {
    memoryStorage[STORAGE_KEYS.USER_DATA] = JSON.stringify(userData);
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    Object.keys(memoryStorage).forEach(key => {
      delete memoryStorage[key];
    });
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}; 