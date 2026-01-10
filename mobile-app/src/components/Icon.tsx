import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { theme } from '../theme';

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
  color = theme.colors.text,
  strokeWidth = 2
}) => {
  const LucideIcon = LucideIcons[name] as any;
  
  if (!LucideIcon) {
    console.warn(`Icon ${name} not found in lucide-react-native`);
    return null;
  }

  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
};
