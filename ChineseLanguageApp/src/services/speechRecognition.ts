/**
 * Speech Recognition Service with Real Voice Functionality
 *
 * Uses @react-native-voice/voice for speech recognition in Chinese
 * Requires development build - will not work in Expo Go
 */

import Voice from '@react-native-voice/voice';

export class SpeechRecognitionService {
  private isListening = false;
  private onResultCallback: ((transcript: string) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    this.setupVoiceListeners();
  }

  /**
   * Set up Voice event listeners
   */
  private setupVoiceListeners() {
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechError = this.onSpeechError;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
  }

  /**
   * Check if voice recording is available
   * Returns true in development builds, false in Expo Go
   */
  isAvailable(): boolean {
    try {
      // Check if Voice module is available (will be null/undefined in Expo Go)
      return Voice && typeof Voice.start === 'function';
    } catch (error) {
      console.log('Voice module not available:', error);
      return false;
    }
  }

  /**
   * Start recording user's voice in Chinese
   * @param onResult - Callback when speech is recognized
   * @param onError - Callback when error occurs
   */
  async startRecording(
    onResult: (transcript: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    if (!this.isAvailable()) {
      onError('Voice recording not available. Please use the built app instead of Expo Go.');
      return;
    }

    try {
      this.onResultCallback = onResult;
      this.onErrorCallback = onError;

      // Stop any existing session
      await Voice.stop();
      await Voice.cancel();

      // Configure for Chinese language
      const locale = 'zh-CN'; // Simplified Chinese

      console.log('🎤 Starting voice recognition in Chinese...');

      // Start voice recognition
      await Voice.start(locale);
      this.isListening = true;

    } catch (error) {
      console.error('Error starting voice recognition:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError(`Failed to start recording: ${errorMessage}`);
      this.isListening = false;
    }
  }

  /**
   * Stop recording and finalize speech recognition
   */
  async stopRecording(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    try {
      console.log('🛑 Stopping voice recognition...');
      await Voice.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      this.isListening = false;
    }
  }

  /**
   * Cancel recording without finalizing
   */
  async cancelRecording(): Promise<void> {
    try {
      console.log('❌ Cancelling voice recognition...');
      await Voice.cancel();
      this.isListening = false;
    } catch (error) {
      console.error('Error cancelling voice recognition:', error);
      this.isListening = false;
    }
  }

  /**
   * Clean up voice recognition resources
   */
  async destroy(): Promise<void> {
    try {
      await Voice.stop();
      await Voice.cancel();
      Voice.destroy().then(Voice.removeAllListeners);
      this.isListening = false;
      this.onResultCallback = null;
      this.onErrorCallback = null;
    } catch (error) {
      console.error('Error destroying voice recognition:', error);
    }
  }

  /**
   * Check if currently recording
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Voice event handlers
   */
  private onSpeechStart = () => {
    console.log('🗣️ Speech recognition started');
    this.isListening = true;
  };

  private onSpeechEnd = () => {
    console.log('🔇 Speech recognition ended');
    this.isListening = false;
  };

  private onSpeechResults = (event: any) => {
    console.log('📝 Speech results:', event.value);

    if (event.value && event.value.length > 0) {
      const transcript = event.value[0];
      console.log('✅ Final transcript:', transcript);

      if (this.onResultCallback) {
        this.onResultCallback(transcript);
      }
    }
  };

  private onSpeechPartialResults = (event: any) => {
    if (event.value && event.value.length > 0) {
      const partialTranscript = event.value[0];
      console.log('⏳ Partial transcript:', partialTranscript);

      // Optionally, you can provide real-time feedback with partial results
      // if (this.onResultCallback) {
      //   this.onResultCallback(partialTranscript);
      // }
    }
  };

  private onSpeechError = (event: any) => {
    console.error('❌ Speech recognition error:', event.error);
    this.isListening = false;

    let errorMessage = 'Speech recognition failed';

    if (event.error) {
      // Handle common error types
      switch (event.error.code) {
        case '7': // ERROR_NO_MATCH
          errorMessage = 'No speech was recognized. Please try again.';
          break;
        case '6': // ERROR_SPEECH_TIMEOUT
          errorMessage = 'Speech timeout. Please speak louder or try again.';
          break;
        case '5': // ERROR_CLIENT
          errorMessage = 'Please check your microphone permissions.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error.message || event.error.code}`;
      }
    }

    if (this.onErrorCallback) {
      this.onErrorCallback(errorMessage);
    }
  };
}
