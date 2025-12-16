import Tts from 'react-native-tts';

/**
 * Text-to-Speech Service
 * Wraps react-native-tts for Chinese audio playback
 */
export class TextToSpeechService {
  constructor() {
    // Initialize TTS with Chinese language and moderate speech rate
    Tts.setDefaultLanguage('zh-CN');
    Tts.setDefaultRate(0.5); // 0.5 = normal speed
  }

  /**
   * Speak Chinese text using native TTS
   * Filters out non-Chinese characters (same as web version)
   * @param text - Text to speak (will extract Chinese only)
   */
  async speak(text: string): Promise<void> {
    try {
      // Extract only Chinese characters (remove English, numbers, punctuation)
      // This matches the web app's behavior in app.js
      const chineseOnly = text
        .replace(/[a-zA-Z0-9\s.,!?;:'"()\-–—\[\]{}\/\\@#$%^&*+=_`~<>|]+/g, '')
        .trim();

      if (!chineseOnly) {
        console.log('No Chinese characters to speak');
        return;
      }

      // Stop any ongoing speech before starting new one
      await Tts.stop();

      // Speak the Chinese text
      await Tts.speak(chineseOnly);
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  }

  /**
   * Stop current speech playback
   */
  async stop(): Promise<void> {
    try {
      await Tts.stop();
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  /**
   * Set speech rate
   * @param rate - Speech rate (0.0 = slowest, 1.0 = fastest)
   */
  async setRate(rate: number): Promise<void> {
    try {
      await Tts.setDefaultRate(rate);
    } catch (error) {
      console.error('Error setting TTS rate:', error);
    }
  }

  /**
   * Get available voices
   * Useful for checking if Chinese TTS is installed on device
   */
  async getAvailableVoices(): Promise<any[]> {
    try {
      const voices = await Tts.voices();
      return voices;
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }
}
