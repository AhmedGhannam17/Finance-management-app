import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/Typography';
import { Icon } from '../components/Icon';
import { Card } from '../components/Card';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

export const SettingsScreen: React.FC = () => {
  const { signOut, user } = useAuth();

  const settingsItems = [
    { icon: 'User', label: 'Profile', onPress: () => {} },
    { icon: 'Coins', label: 'Currency', value: 'INR', onPress: () => {} },
    { icon: 'Bell', label: 'Notifications', onPress: () => {} },
    { icon: 'Shield', label: 'Security', onPress: () => {} },
    { icon: 'HelpCircle', label: 'Support', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant="h2" style={styles.title}>Settings</Typography>

        <Card style={styles.profileSection} variant="flat">
          <View style={styles.avatar}>
            <Icon name="User" size={32} color={theme.colors.primary} />
          </View>
          <View>
            <Typography variant="h4">{user?.email?.split('@')[0] || 'User'}</Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>{user?.email}</Typography>
          </View>
        </Card>

        <Typography variant="label" style={styles.sectionLabel}>Preference</Typography>
        <Card style={styles.settingsCard} variant="outlined" padding="none">
          {settingsItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.item, 
                index < settingsItems.length - 1 && styles.border
              ]}
              onPress={item.onPress}
            >
              <View style={styles.itemLeft}>
                <View style={[styles.iconBg, { backgroundColor: theme.colors.primary + '10' }]}>
                  <Icon name={item.icon as any} size={20} color={theme.colors.primary} />
                </View>
                <Typography variant="body">{item.label}</Typography>
              </View>
              <View style={styles.itemRight}>
                {item.value && (
                  <Typography variant="bodySmall" color={theme.colors.textSecondary} style={{ marginRight: 8 }}>
                    {item.value}
                  </Typography>
                )}
                <Icon name="ChevronRight" size={20} color={theme.colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Icon name="LogOut" size={20} color={theme.colors.error} />
          <Typography variant="body" color={theme.colors.error} style={{ marginLeft: 12, fontWeight: '600' }}>
            Logout
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.xl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  sectionLabel: {
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  settingsCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.error + '10',
    marginTop: theme.spacing.md,
  },
});
