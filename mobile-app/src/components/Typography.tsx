import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { theme as defaultTheme } from '../theme';

type TypographyVariant = keyof typeof defaultTheme.typography;

interface TypographyProps {
  variant?: TypographyVariant;
  color?: string;
  style?: TextStyle;
  children: React.ReactNode;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
  onPress?: () => void;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  style,
  children,
  align = 'auto',
  numberOfLines,
  onPress,
}) => {
  const { theme } = useTheme();
  const variantStyle = theme.typography[variant];
  const textColor = color || (variant.startsWith('h') ? theme.colors.text : theme.colors.textSecondary);

  return (
    <Text
      style={[
        variantStyle,
        { color: textColor, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
};
