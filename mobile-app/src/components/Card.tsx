import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  variant = 'elevated',
  padding = 'md' 
}) => {
  const getCardStyle = () => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: padding === 'none' ? 0 : theme.spacing[padding],
    };

    if (variant === 'elevated') {
      return {
        ...baseStyle,
        ...theme.shadows.md,
      };
    }

    if (variant === 'outlined') {
      return {
        ...baseStyle,
        borderWidth: 1,
        borderColor: theme.colors.border,
      };
    }

    return baseStyle; // flat
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
};
