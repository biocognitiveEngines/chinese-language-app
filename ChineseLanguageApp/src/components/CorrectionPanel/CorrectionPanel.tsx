import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Correction } from '../../types/message.types';
import { useApp } from '../../context/AppContext';

interface Props {
  correction: Correction;
}

const CorrectionPanel: React.FC<Props> = ({ correction }) => {
  const { dispatch } = useApp();

  const handleClose = () => {
    dispatch({ type: 'SET_CORRECTION', payload: null });
  };

  const isGrammar = correction.type === 'grammar_correction';

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isGrammar ? '📝 Grammar Correction' : '💡 Language Help'}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Grammar correction: original → corrected */}
        {isGrammar && correction.original && correction.corrected && (
          <View style={styles.correctionSection}>
            <View style={styles.row}>
              <Text style={styles.label}>Original:</Text>
              <Text style={styles.originalText}>{correction.original}</Text>
            </View>
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>↓</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Corrected:</Text>
              <Text style={styles.correctedText}>{correction.corrected}</Text>
            </View>
          </View>
        )}

        {/* Explanation */}
        <View style={styles.explanationSection}>
          <Text style={styles.explanationLabel}>Explanation:</Text>
          <Text style={styles.explanationText}>{correction.explanation}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  closeButton: {
    padding: 4
  },
  closeIcon: {
    fontSize: 24,
    color: '#666'
  },
  correctionSection: {
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12
  },
  row: {
    marginVertical: 4
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4
  },
  originalText: {
    fontSize: 15,
    color: '#FF3B30',
    textDecorationLine: 'line-through'
  },
  arrow: {
    alignItems: 'center',
    marginVertical: 4
  },
  arrowText: {
    fontSize: 20,
    color: '#007AFF'
  },
  correctedText: {
    fontSize: 15,
    color: '#34C759',
    fontWeight: '500'
  },
  explanationSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6
  },
  explanationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  }
});

export default CorrectionPanel;
