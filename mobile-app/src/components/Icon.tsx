import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export type IconName = keyof typeof LucideIcons;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color,
  strokeWidth = 2
}) => {
  const { theme } = useTheme();
  const LucideIcon = LucideIcons[name] as any;
  const iconColor = color || theme.colors.text;
  
  if (!LucideIcon) {
    console.warn(`Icon ${name} not found in lucide-react-native`);
    return null;
  }

  return <LucideIcon size={size} color={iconColor} strokeWidth={strokeWidth} />;
};
