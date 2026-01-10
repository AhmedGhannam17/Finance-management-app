import React from 'react';
import { TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from './Icon';
import { theme } from '../theme';

export const FloatingActionButton: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.navigate('TransactionForm', { transactionId: null })}
      activeOpacity={0.8}
    >
      <View style={styles.fabInner}>
        <Icon name="Plus" size={32} color="#FFFFFF" strokeWidth={3} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30, // Above tab bar usually
    alignSelf: 'center',
    zIndex: 1000,
    ...theme.shadows.md,
  },
  fabInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
