import React, { useRef, useEffect } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import MessageBubble from './MessageBubble';
import { Message } from '../../types/message.types';

interface Props {
  messages: Message[];
}

const ConversationView: React.FC<Props> = ({ messages }) => {
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure list has rendered
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item, index }: { item: Message; index: number }) => (
    <MessageBubble message={item} key={`${item.timestamp}-${index}`} />
  );

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item, index) => `${item.timestamp}-${index}`}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          {/* Empty state - could add a welcome message here */}
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  }
});

export default ConversationView;
