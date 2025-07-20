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
    return memoryStorage[STORAGE_KEYS.AUTH_TOKEN] || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Set stored token
export const setToken = async (token: string): Promise<void> => {
  try {
    memoryStorage[STORAGE_KEYS.AUTH_TOKEN] = token;
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

// Clear stored token
export const clearToken = async (): Promise<void> => {
  try {
    delete memoryStorage[STORAGE_KEYS.AUTH_TOKEN];
  } catch (error) {
    console.error('Error clearing token:', error);
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