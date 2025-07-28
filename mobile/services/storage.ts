import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  GOOGLE_ACCESS_TOKEN: 'googleAccessToken',
  USER_DATA: 'userData',
};

// Get stored token
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    console.log('[storage] getToken called, token present:', !!token, 'length:', token?.length || 0);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Set stored token
export const setToken = async (token: string): Promise<void> => {
  try {
    console.log('[storage] setToken called with token length:', token?.length || 0);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    console.log('[storage] Token saved successfully to AsyncStorage');
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

// Clear stored token
export const clearToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    console.log('[storage] Token cleared from AsyncStorage');
  } catch (error) {
    console.error('Error clearing token:', error);
  }
};

// Get Google access token
export const getGoogleAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN);
  } catch (error) {
    console.error('Error getting Google token:', error);
    return null;
  }
};

// Set Google access token
export const setGoogleAccessToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN, token);
  } catch (error) {
    console.error('Error setting Google token:', error);
  }
};

// Get user data
export const getUserData = async (): Promise<any | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Set user data
export const setUserData = async (userData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    console.log('[storage] User data saved to AsyncStorage');
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

// Clear all stored data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.GOOGLE_ACCESS_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
    console.log('[storage] All data cleared from AsyncStorage');
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}; 