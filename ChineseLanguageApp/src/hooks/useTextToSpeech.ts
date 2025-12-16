import { useRef, useEffect } from 'react';
import { TextToSpeechService } from '../services/textToSpeech';

/**
 * Custom hook for Text-to-Speech functionality
 * Manages TTS service lifecycle and provides speak/stop functions
 */
export const useTextToSpeech = () => {
  const ttsService = useRef(new TextToSpeechService()).current;

  useEffect(() => {
    // Cleanup: stop TTS when component unmounts
    return () => {
      ttsService.stop();
    };
  }, [ttsService]);

  /**
   * Speak Chinese text using native TTS
   * @param text - Text to speak (will extract Chinese only)
   */
  const speak = async (text: string) => {
    await ttsService.speak(text);
  };

  /**
   * Stop current speech playback
   */
  const stop = async () => {
    await ttsService.stop();
  };

  /**
   * Set speech rate
   * @param rate - Speech rate (0.0 = slowest, 1.0 = fastest)
   */
  const setRate = async (rate: number) => {
    await ttsService.setRate(rate);
  };

  return { speak, stop, setRate };
};
