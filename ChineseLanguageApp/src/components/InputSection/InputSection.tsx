import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useConversation } from '../../hooks/useConversation';

const InputSection: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const { sendMessage, isProcessing } = useConversation();

  const handleSend = async () => {
    if (inputText.trim() && !isProcessing) {
      await sendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Type in Chinese..."
        placeholderTextColor="#999"
        multiline
        maxLength={500}
        editable={!isProcessing}
      />
      <TouchableOpacity
        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!inputText.trim() || isProcessing}
        activeOpacity={0.7}
      >
        <Text style={styles.sendIcon}>➤</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC'
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600'
  }
});

export default InputSection;
