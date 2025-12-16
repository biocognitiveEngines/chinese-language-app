// API Configuration for Chinese Language Learning App
// __DEV__ is a React Native global that indicates development mode

export const API_CONFIG = {
  // Android emulator uses 10.0.2.2 to access host machine's localhost
  // In production, use the Vercel URL
  BASE_URL: __DEV__
    ? 'http://10.0.2.2:5000'
    : 'https://chinese-language-app.vercel.app',

  ENDPOINTS: {
    CHAT: '/api/chat',
    RANDOM_TOPIC: '/api/random-topic',
    HEALTH: '/api/health'
  },

  TIMEOUT: 30000 // 30 seconds
};
