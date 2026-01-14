import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Icon, IconName } from './Icon';
import { Typography } from './Typography';
import { Button } from './Button';

interface EmptyStateProps {
  message: string;
  subMessage?: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  subMessage,
  icon = 'Search',
  actionLabel,
  onAction,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={48} color={theme.colors.textTertiary} strokeWidth={1.5} />
      </View>
      <Typography variant="h3" align="center" style={styles.message}>
        {message}
      </Typography>
      {subMessage && (
        <Typography variant="body" align="center" color={theme.colors.textSecondary} style={styles.subMessage}>
          {subMessage}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button 
          title={actionLabel} 
          onPress={onAction} 
          variant="outline" 
          size="sm"
          style={styles.button}
        />
      )}
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    padding: theme.spacing.xl * 2,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  message: {
    marginBottom: theme.spacing.sm,
  },
  subMessage: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  button: {
    minWidth: 150,
  },
});

