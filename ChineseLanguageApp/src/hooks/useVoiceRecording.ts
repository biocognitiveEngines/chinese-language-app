import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SpeechRecognitionService } from '../services/speechRecognition';

/**
 * Custom hook for voice recording functionality
 * Manages speech recognition service and recording state
 */
export const useVoiceRecording = () => {
  const { state, dispatch } = useApp();
  const [error, setError] = useState<string | null>(null);
  const speechService = useRef(new SpeechRecognitionService()).current;

  useEffect(() => {
    // Cleanup: destroy speech service when component unmounts
    return () => {
      speechService.destroy();
    };
  }, [speechService]);

  /**
   * Start voice recording
   */
  const startRecording = async () => {
    setError(null);
    dispatch({ type: 'SET_RECORDING', payload: true });

    await speechService.startRecording(
      // onResult callback
      (transcript) => {
        dispatch({ type: 'SET_RECORDED_MESSAGE', payload: transcript });
      },
      // onError callback
      (errorMessage) => {
        setError(errorMessage);
        dispatch({ type: 'SET_RECORDING', payload: false });
      }
    );
  };

  /**
   * Stop voice recording
   */
  const stopRecording = async () => {
    await speechService.stopRecording();
    dispatch({ type: 'SET_RECORDING', payload: false });
  };

  /**
   * Cancel voice recording
   */
  const cancelRecording = async () => {
    await speechService.cancelRecording();
    dispatch({ type: 'SET_RECORDING', payload: false });
    dispatch({ type: 'SET_RECORDED_MESSAGE', payload: '' });
  };

  return {
    isRecording: state.isRecording,
    recordedMessage: state.recordedMessage,
    error,
    startRecording,
    stopRecording,
    cancelRecording
  };
};
