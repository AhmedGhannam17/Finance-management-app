import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Icon } from './Icon';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  style,
  secureTextEntry,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input, 
            error && styles.inputError, 
            style,
            secureTextEntry && { paddingRight: 50 }
          ]}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Icon 
              name={isPasswordVisible ? "EyeOff" : "Eye"} 
              size={20} 
              color={theme.colors.textTertiary} 
            />
          </TouchableOpacity>
        )}
      </View>
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    ...theme.typography.body,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.text,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  helperText: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

