import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Typography } from '../components/Typography';
import { useTheme } from '../context/ThemeContext';
import { theme as staticTheme } from '../theme';
import { Icon } from '../components/Icon';

export const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  // If updateProfile is not in context, we might need a mock or implementation
  // For now assuming it is there or I'll use a placeholder
  const handleSave = async () => {
    setLoading(true);
    try {
        if (updateProfile) {
            await updateProfile({ name });
        }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Icon name="ChevronLeft" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Typography variant="h3">Edit Profile</Typography>
            <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
            <View style={styles.avatarSection}>
                 <View style={styles.avatar}>
                    <Icon name="User" size={40} color={theme.colors.primary} />
                </View>
            </View>

          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your Name"
          />

          <Input
            label="Username"
            value={user?.username || ''}
            editable={false}
            placeholder="Username"
            autoCapitalize="none"
            helperText="Username cannot be changed."
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            style={styles.button}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
  },
  backBtn: {
      padding: 8,
  },
  content: {
    padding: theme.spacing.lg,
  },
  avatarSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  button: {
    marginTop: theme.spacing.xl,
  },
});
