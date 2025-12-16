import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useConversation } from '../../hooks/useConversation';

const ControlBar: React.FC = () => {
  const {
    clearConversation,
    repeatLastMessage,
    getRandomTopic,
    toggleAutoSpeak,
    autoSpeak,
    isProcessing
  } = useConversation();

  const Button: React.FC<{
    icon: string;
    label: string;
    onPress: () => void;
    disabled?: boolean;
  }> = ({ icon, label, onPress, disabled }) => (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top row: Clear, Repeat, Random */}
      <View style={styles.row}>
        <Button icon="🗑️" label="Clear" onPress={clearConversation} />
        <Button icon="🔁" label="Repeat" onPress={repeatLastMessage} />
        <Button
          icon="🎲"
          label="Random"
          onPress={getRandomTopic}
          disabled={isProcessing}
        />
      </View>

      {/* Bottom row: Auto-speak toggle */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.toggleButton, autoSpeak && styles.toggleButtonActive]}
          onPress={toggleAutoSpeak}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleIcon}>{autoSpeak ? '🔊' : '🔇'}</Text>
          <Text style={[styles.toggleLabel, autoSpeak && styles.toggleLabelActive]}>
            Auto-Speak {autoSpeak ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 4
  },
  button: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    minWidth: 80
  },
  buttonDisabled: {
    opacity: 0.5
  },
  icon: {
    fontSize: 24,
    marginBottom: 4
  },
  label: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500'
  },
  labelDisabled: {
    color: '#999'
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#D0D0D0'
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  toggleIcon: {
    fontSize: 20,
    marginRight: 8
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600'
  },
  toggleLabelActive: {
    color: '#FFFFFF'
  }
});

export default ControlBar;
