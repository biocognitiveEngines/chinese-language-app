// API Configuration for Chinese Language Learning App
// __DEV__ is a React Native global that indicates development mode

// Import Constants with proper error handling for TypeScript
let Constants: any;
try {
  Constants = require('expo-constants').default;
} catch (error) {
  // Fallback if expo-constants is not available (e.g., during TS compilation)
  Constants = { appOwnership: null };
}

// Declare __DEV__ global for TypeScript
declare const __DEV__: boolean;

// Determine if we should use production backend
const isExpoGo = Constants.appOwnership === 'expo';
const isProduction = typeof __DEV__ === 'undefined' || !__DEV__;
const useProductionBackend = isExpoGo || isProduction;

// Debug logging
console.log('🔧 API Config Debug:', {
  appOwnership: Constants.appOwnership,
  isExpoGo,
  isProduction,
  useProductionBackend,
  __DEV__: typeof __DEV__ !== 'undefined' ? __DEV__ : 'undefined'
});

export const API_CONFIG = {
  // Use production URL for Expo Go or production builds
  // Use local development server only for emulator/simulator builds
  BASE_URL: useProductionBackend
    ? 'https://chinese-language-app.vercel.app'
    : 'http://10.0.2.2:5000',

  ENDPOINTS: {
    CHAT: '/api/chat',
    RANDOM_TOPIC: '/api/random-topic',
    HEALTH: '/api/health'
  },

  TIMEOUT: 30000 // 30 seconds
};

console.log('🌐 API Base URL:', API_CONFIG.BASE_URL);
