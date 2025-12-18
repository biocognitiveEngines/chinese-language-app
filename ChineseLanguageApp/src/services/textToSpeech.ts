import * as Speech from 'expo-speech';

/**
 * Text-to-Speech Service
 * Wraps expo-speech for Chinese audio playback
 */
export class TextToSpeechService {
  private rate: number = 0.8;

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
      await Speech.stop();

      // Speak the Chinese text
      Speech.speak(chineseOnly, {
        language: 'zh-CN',
        rate: this.rate,
      });
    } catch (error) {
      console.error('Error speaking text:', error);
    }
  }

  /**
   * Stop current speech playback
   */
  async stop(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  /**
   * Set speech rate
   * @param rate - Speech rate (0.0 = slowest, 1.0 = fastest)
   */
  async setRate(rate: number): Promise<void> {
    this.rate = rate;
  }

  /**
   * Get available voices
   * Useful for checking if Chinese TTS is installed on device
   */
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }
}
