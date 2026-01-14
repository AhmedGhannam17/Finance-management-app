import React, { forwardRef, useImperativeHandle } from 'react';
import { TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export interface SmartFABRef {
  show: () => void;
  hide: () => void;
}

export const SmartFAB = forwardRef<SmartFABRef>((_, ref) => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const translateY = useSharedValue(200);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useImperativeHandle(ref, () => ({
    show: () => {
      translateY.value = withSpring(0, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12 });
    },
    hide: () => {
      translateY.value = withTiming(200, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.5, { duration: 200 });
    },
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  // Prevent touches when hidden
  const pointerEvents = opacity.value < 0.1 ? 'none' : 'auto';

  const styles = getStyles(theme);

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]}
      pointerEvents={pointerEvents as any}
    >
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TransactionForm', { transactionId: null })}
        activeOpacity={0.8}
      >
        <Icon name="Plus" size={24} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110, // Increased to avoid tab bar overlap
    right: 25,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
});
