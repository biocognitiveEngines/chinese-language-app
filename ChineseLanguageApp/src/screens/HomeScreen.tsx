import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConversationView from '../components/ConversationView/ConversationView';
import MicrophoneButton from '../components/AudioControls/MicrophoneButton';
import InputSection from '../components/InputSection/InputSection';
import ControlBar from '../components/ControlBar/ControlBar';
import CorrectionPanel from '../components/CorrectionPanel/CorrectionPanel';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useApp } from '../context/AppContext';

const HomeScreen: React.FC = () => {
  const { state } = useApp();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>中文学习 Chinese Learning</Text>
        </View>

        {/* Conversation area */}
        <View style={styles.conversationContainer}>
          <ConversationView messages={state.conversationHistory} />
        </View>

        {/* Audio controls */}
        <MicrophoneButton />

        {/* Text input */}
        <InputSection />

        {/* Control buttons */}
        <ControlBar />

        {/* Correction panel (if present) */}
        {state.currentCorrection && (
          <CorrectionPanel correction={state.currentCorrection} />
        )}

        {/* Loading spinner */}
        {state.isProcessing && <LoadingSpinner />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Import Text
import { Text } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#0056B3'
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600'
  },
  conversationContainer: {
    flex: 1
  }
});

export default HomeScreen;
