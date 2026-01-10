import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { theme } from '../theme';

type TypographyVariant = keyof typeof theme.typography;

interface TypographyProps {
  variant?: TypographyVariant;
  color?: string;
  style?: TextStyle;
  children: React.ReactNode;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  style,
  children,
  align = 'auto',
  numberOfLines,
}) => {
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
    >
      {children}
    </Text>
  );
};
