import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import modalReducer from './slices/modalSlice';

// Configure persist for auth state
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'isAuthenticated', 'userType'], // Only persist these fields
  blacklist: ['signupForm', 'isLoading', 'error'] // Don't persist these
};

// Configure persist for modal state (optional, but good for UX)
const modalPersistConfig = {
  key: 'modal',
  storage: AsyncStorage,
  whitelist: [], // Don't persist modal state
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedModalReducer = persistReducer(modalPersistConfig, modalReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    modal: persistedModalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PURGE'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
      immutableCheck: {
        ignoredPaths: ['auth.signupForm'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 