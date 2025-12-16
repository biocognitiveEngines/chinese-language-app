import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View
} from 'react-native';
import { useVoiceRecording } from '../../hooks/useVoiceRecording';
import { useConversation } from '../../hooks/useConversation';

const MicrophoneButton: React.FC = () => {
  const { isRecording, recordedMessage, startRecording, stopRecording } =
    useVoiceRecording();
  const { sendMessage } = useConversation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation for recording state
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Handle when user presses down (start recording)
  const handlePressIn = async () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
    await startRecording();
  };

  // Handle when user releases (stop recording and send)
  const handlePressOut = async () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true
    }).start();
    await stopRecording();

    // Send the recorded message if not empty
    if (recordedMessage.trim()) {
      await sendMessage(recordedMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            transform: [{ scale: scaleAnim }, { scale: pulseAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.button, isRecording && styles.buttonActive]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Text style={styles.icon}>🎤</Text>
          <Text style={styles.text}>
            {isRecording ? 'Recording...' : 'Hold to Record'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Show recorded transcript */}
      {recordedMessage && !isRecording && (
        <Text style={styles.transcript}>{recordedMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16
  },
  buttonWrapper: {
    borderRadius: 50
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 160
  },
  buttonActive: {
    backgroundColor: '#FF3B30'
  },
  icon: {
    fontSize: 32,
    marginBottom: 8
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  transcript: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    maxWidth: '80%',
    color: '#333'
  }
});

// Import useEffect
import { useEffect } from 'react';

export default MicrophoneButton;
