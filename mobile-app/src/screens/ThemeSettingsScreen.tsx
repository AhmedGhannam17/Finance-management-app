import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Typography } from '../components/Typography';
import { Icon } from '../components/Icon';
import { Card } from '../components/Card';
import { theme as defaultTheme } from '../theme';
import { useTheme } from '../context/ThemeContext';

const ACCENT_OPTIONS: { name: string; color: string; value: any }[] = [
  { name: 'Classic Zinc', color: '#18181b', value: 'zinc' },
  { name: 'Ocean Blue', color: '#3b82f6', value: 'blue' },
  { name: 'Royal Purple', color: '#a855f7', value: 'purple' },
  { name: 'Forest Green', color: '#22c55e', value: 'green' },
  { name: 'Vivid Orange', color: '#f97316', value: 'orange' },
  { name: 'Barbie Pink', color: '#ec4899', value: 'pink' },
];

const LIGHT_THEMES = [
  { id: 'light-blue', name: 'Sky Blue', primary: '#0ea5e9', background: '#f8fafc' },
  { id: 'light-green', name: 'Mint Fresh', primary: '#10b981', background: '#f0fdf4' },
  { id: 'light-purple', name: 'Lavender', primary: '#8b5cf6', background: '#f5f3ff' },
  { id: 'light-orange', name: 'Peach', primary: '#f97316', background: '#fff7ed' },
];

export const ThemeSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { accentColor, setAccentColor, mode, setMode, theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="ArrowLeft" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Typography variant="h2">Theme Settings</Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Typography variant="h4" style={styles.sectionTitle}>Appearance</Typography>
        <Card style={styles.card} variant="flat">
          <View style={styles.row}>
            <View style={styles.modeLabelGroup}>
                <View style={{ marginRight: 12 }}>
                    <Icon name="Moon" size={20} color={theme.colors.textSecondary} />
                </View>
                <Typography variant="body">Dark Mode</Typography>
            </View>
            <TouchableOpacity 
              onPress={() => setMode('dark')} 
              style={[styles.modeBtn, mode === 'dark' && styles.activeMode]}
            >
              {mode === 'dark' && <Icon name="Check" size={16} color="#fff" />}
            </TouchableOpacity>
          </View>
          <View style={[styles.row, { marginTop: 16 }]}>
            <View style={styles.modeLabelGroup}>
                <View style={{ marginRight: 12 }}>
                    <Icon name="Sun" size={20} color={theme.colors.textSecondary} />
                </View>
                <Typography variant="body">Light Mode</Typography>
            </View>
            <TouchableOpacity 
              onPress={() => setMode('light')} 
              style={[styles.modeBtn, mode === 'light' && styles.activeLightMode]}
            >
              {mode === 'light' && <Icon name="Check" size={16} color="#fff" />}
            </TouchableOpacity>
          </View>
        </Card>

        {mode === 'dark' ? (
          <>
            <Typography variant="h4" style={styles.sectionTitle}>Accent Color</Typography>
            <View style={styles.accentGrid}>
              {ACCENT_OPTIONS.map((option) => (
                <TouchableOpacity 
                  key={option.value}
                  onPress={() => setAccentColor(option.value)}
                  style={styles.accentItem}
                >
                  <View style={[
                    styles.colorCircle, 
                    { backgroundColor: option.color },
                    accentColor === option.value && styles.activeCircle
                  ]}>
                    {accentColor === option.value && <Icon name="Check" size={20} color="#fff" />}
                  </View>
                  <Typography 
                    variant="caption" 
                    color={accentColor === option.value ? theme.colors.primary : theme.colors.textSecondary}
                    style={{ marginTop: 8, fontWeight: accentColor === option.value ? '700' : '400' }}
                  >
                    {option.name}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <Typography variant="h4" style={styles.sectionTitle}>Light Themes</Typography>
            <View style={styles.accentGrid}>
              {LIGHT_THEMES.map((option) => (
                <TouchableOpacity 
                  key={option.id}
                  onPress={() => setAccentColor(option.id as any)}
                  style={styles.accentItem}
                >
                  <View style={[
                    styles.colorCircle, 
                    { backgroundColor: option.primary },
                    accentColor === option.id && styles.activeCircle
                  ]}>
                    {accentColor === option.id && <Icon name="Check" size={20} color="#fff" />}
                  </View>
                  <Typography 
                    variant="caption" 
                    color={accentColor === option.id ? theme.colors.primary : theme.colors.textSecondary}
                    style={{ marginTop: 8, fontWeight: accentColor === option.id ? '700' : '400' }}
                  >
                    {option.name}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Typography variant="caption" color={theme.colors.textTertiary} style={styles.note}>
          Changes are applied instantly across the entire application.
        </Typography>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMode: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  activeLightMode: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  accentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  accentItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  activeCircle: {
    borderColor: theme.colors.text,
    transform: [{ scale: 1.1 }],
  },
  note: {
    textAlign: 'center',
    marginTop: 32,
  },
});
