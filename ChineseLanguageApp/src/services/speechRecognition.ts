import Voice from '@react-native-voice/voice';

/**
 * Speech Recognition Service
 * Wraps @react-native-voice/voice for Chinese speech-to-text
 */
export class SpeechRecognitionService {
  private isListening = false;

  /**
   * Start recording user's voice in Chinese
   * @param onResult - Callback when speech is recognized
   * @param onError - Callback when error occurs
   */
  async startRecording(
    onResult: (transcript: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      // Start voice recognition for Chinese (zh-CN)
      await Voice.start('zh-CN');
      this.isListening = true;

      // Set up event handlers
      Voice.onSpeechResults = (e) => {
        if (e.value && e.value[0]) {
          onResult(e.value[0]);
        }
      };

      Voice.onSpeechError = (e) => {
        this.isListening = false;
        onError(e.error?.message || 'Speech recognition error');
      };

      Voice.onSpeechEnd = () => {
        this.isListening = false;
      };

    } catch (error) {
      this.isListening = false;
      onError('Failed to start recording');
    }
  }

  /**
   * Stop recording and finalize speech recognition
   */
  async stopRecording(): Promise<void> {
    try {
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  /**
   * Cancel recording without finalizing
   */
  async cancelRecording(): Promise<void> {
    try {
      await Voice.cancel();
      this.isListening = false;
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  }

  /**
   * Clean up voice recognition resources
   * Call this when component unmounts
   */
  async destroy(): Promise<void> {
    try {
      await Voice.destroy();
      this.isListening = false;
      Voice.removeAllListeners();
    } catch (error) {
      console.error('Error destroying voice:', error);
    }
  }

  /**
   * Check if currently recording
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}
