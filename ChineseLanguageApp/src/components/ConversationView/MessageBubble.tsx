import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Message } from '../../types/message.types';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { containsChinese } from '../../utils/chineseDetector';

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  const { speak } = useTextToSpeech();
  const isUser = message.sender === 'user';
  const hasChinese = containsChinese(message.message);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {/* Main message bubble */}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
          {message.message}
        </Text>
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
          {formatTime(message.timestamp)}
        </Text>

        {/* Replay button for AI messages with Chinese */}
        {!isUser && hasChinese && (
          <TouchableOpacity
            style={styles.replayButton}
            onPress={() => speak(message.message)}
            activeOpacity={0.7}
          >
            <Text style={styles.replayIcon}>🔊</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Translation bubble (if present) */}
      {message.translation && (
        <View
          style={[
            styles.translationBubble,
            isUser ? styles.userTranslation : styles.aiTranslation
          ]}
        >
          <Text style={styles.translationText}>{message.translation}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    maxWidth: '80%'
  },
  userContainer: {
    alignSelf: 'flex-end'
  },
  aiContainer: {
    alignSelf: 'flex-start'
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  userBubble: {
    backgroundColor: '#007AFF'
  },
  aiBubble: {
    backgroundColor: '#E9ECEF'
  },
  text: {
    fontSize: 16,
    lineHeight: 22
  },
  userText: {
    color: '#FFFFFF'
  },
  aiText: {
    color: '#000000'
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4
  },
  userTimestamp: {
    color: '#FFFFFF',
    opacity: 0.7
  },
  aiTimestamp: {
    color: '#666666'
  },
  translationBubble: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
    opacity: 0.9
  },
  userTranslation: {
    backgroundColor: '#B3D9FF'
  },
  aiTranslation: {
    backgroundColor: '#F8F9FA'
  },
  translationText: {
    fontSize: 13,
    color: '#555555',
    fontStyle: 'italic'
  },
  replayButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 4
  },
  replayIcon: {
    fontSize: 18
  }
});

export default MessageBubble;
