import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { Message, ChatAPIResponse, RandomTopicResponse } from '../types/message.types';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API service for Chinese Language Learning app
export const chatAPI = {
  /**
   * Send a message to the backend and get AI response
   * @param message - User's message in Chinese
   * @param conversationHistory - Previous conversation messages for context
   * @returns AI response with translation and optional correction
   */
  sendMessage: async (
    message: string,
    conversationHistory: Message[]
  ): Promise<ChatAPIResponse> => {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CHAT, {
        message,
        conversation_history: conversationHistory
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Get a random conversation topic from the backend
   * @returns Random topic suggestion in Chinese
   */
  getRandomTopic: async (): Promise<RandomTopicResponse> => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.RANDOM_TOPIC);
      return response.data;
    } catch (error) {
      console.error('Error getting random topic:', error);
      throw error;
    }
  },

  /**
   * Health check endpoint to verify backend connectivity
   * @returns Health status
   */
  healthCheck: async (): Promise<any> => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
};
