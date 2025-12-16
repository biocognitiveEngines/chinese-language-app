import { PermissionsAndroid, Platform } from 'react-native';

/**
 * Request microphone permission for Android
 * iOS permissions are handled via Info.plist in Expo
 * @returns Promise<boolean> - true if permission granted
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Chinese Language App needs access to your microphone for speech recognition.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK'
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Error requesting microphone permission:', err);
      return false;
    }
  }
  // iOS permissions handled automatically by Expo
  return true;
};

/**
 * Check if microphone permission has been granted
 * @returns Promise<boolean>
 */
export const checkMicrophonePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return result;
    } catch (err) {
      console.error('Error checking microphone permission:', err);
      return false;
    }
  }
  return true;
};
