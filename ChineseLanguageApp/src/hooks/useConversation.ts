import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { chatAPI } from '../services/api';
import { useTextToSpeech } from './useTextToSpeech';

/**
 * Custom hook for conversation management
 * Handles sending messages, receiving responses, and auto-speak
 */
export const useConversation = () => {
  const { state, dispatch } = useApp();
  const { speak } = useTextToSpeech();

  /**
   * Send a message to the backend and handle response
   * @param message - User's message in Chinese
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (state.isProcessing) {
        console.log('Already processing a message');
        return;
      }

      if (!message.trim()) {
        console.log('Empty message, not sending');
        return;
      }

      // Add user message to conversation history
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          sender: 'user',
          message,
          timestamp: new Date().toISOString()
        }
      });

      // Clear recorded message
      dispatch({ type: 'SET_RECORDED_MESSAGE', payload: '' });

      // Start processing
      dispatch({ type: 'SET_PROCESSING', payload: true });

      try {
        // Call backend API
        const response = await chatAPI.sendMessage(
          message,
          state.conversationHistory
        );

        // Add AI response to conversation history
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            sender: 'ai',
            message: response.response,
            translation: response.translation,
            timestamp: new Date().toISOString()
          }
        });

        // Show correction if present
        if (response.correction) {
          dispatch({ type: 'SET_CORRECTION', payload: response.correction });

          // Auto-hide correction after 10 seconds
          setTimeout(() => {
            dispatch({ type: 'SET_CORRECTION', payload: null });
          }, 10000);
        }

        // Auto-speak if enabled
        if (state.autoSpeak && response.response) {
          await speak(response.response);
        }
      } catch (error) {
        console.error('Error sending message:', error);

        // Add error message
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            sender: 'ai',
            message: '抱歉，出现了错误。请再试一次。',
            translation: 'Sorry, there was an error. Please try again.',
            timestamp: new Date().toISOString()
          }
        });
      } finally {
        dispatch({ type: 'SET_PROCESSING', payload: false });
      }
    },
    [state.conversationHistory, state.isProcessing, state.autoSpeak, dispatch, speak]
  );

  /**
   * Get a random conversation topic
   */
  const getRandomTopic = useCallback(async () => {
    if (state.isProcessing) {
      return;
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });

    try {
      const response = await chatAPI.getRandomTopic();

      // Add topic as AI message
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          sender: 'ai',
          message: response.topic,
          timestamp: new Date().toISOString()
        }
      });

      // Auto-speak if enabled
      if (state.autoSpeak) {
        await speak(response.topic);
      }
    } catch (error) {
      console.error('Error getting random topic:', error);
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.isProcessing, state.autoSpeak, dispatch, speak]);

  /**
   * Repeat the last AI message
   */
  const repeatLastMessage = useCallback(async () => {
    // Find last AI message
    const lastAiMessage = [...state.conversationHistory]
      .reverse()
      .find((msg) => msg.sender === 'ai');

    if (lastAiMessage) {
      await speak(lastAiMessage.message);
    }
  }, [state.conversationHistory, speak]);

  /**
   * Clear conversation history
   */
  const clearConversation = useCallback(() => {
    dispatch({ type: 'CLEAR_CONVERSATION' });
  }, [dispatch]);

  /**
   * Toggle auto-speak setting
   */
  const toggleAutoSpeak = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUTO_SPEAK' });
  }, [dispatch]);

  return {
    sendMessage,
    getRandomTopic,
    repeatLastMessage,
    clearConversation,
    toggleAutoSpeak,
    isProcessing: state.isProcessing,
    autoSpeak: state.autoSpeak
  };
};
