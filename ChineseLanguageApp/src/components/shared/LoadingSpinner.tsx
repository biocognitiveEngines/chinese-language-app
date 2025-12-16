import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const LoadingSpinner: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.spinner}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.text}>Thinking...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)'
  },
  spinner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  }
});

export default LoadingSpinner;
