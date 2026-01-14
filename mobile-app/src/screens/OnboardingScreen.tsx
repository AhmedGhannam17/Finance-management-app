import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../components/Button';
import { Typography } from '../components/Typography';
import { Icon } from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/analytics';

const { width } = Dimensions.get('window');

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [step, setStep] = useState(0); // 0: Intro, 1: Currency
  const [selectedCurrency, setSelectedCurrency] = useState('INR');

  const nextStep = () => {
    if (step === 0) setStep(1);
    else navigation.navigate('Login');
  };

  const renderIntro = () => (
    <View style={styles.stepContainer}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Icon name="Crown" size={60} color={theme.colors.primary} />
        </View>
        <Typography variant="h1" style={styles.title}>Amanah</Typography>
        <Typography variant="body" color={theme.colors.textSecondary} align="center" style={styles.subtitle}>
          Your Trustworthy Companion for Manual Finance Tracking & Zakat
        </Typography>
      </View>
      
      <View style={styles.features}>
        <FeatureItem icon="ShieldCheck" text="Private & Secure data management" theme={theme} styles={styles} />
        <FeatureItem icon="History" text="Track Every Transaction manually" theme={theme} styles={styles} />
        <FeatureItem icon="Calculator" text="Accurate Zakat Calculation" theme={theme} styles={styles} />
      </View>
    </View>
  );

  const renderCurrencySelect = () => (
    <View style={styles.stepContainer}>
      <Typography variant="h2" align="center" style={styles.title}>Choose Base Currency</Typography>
      <Typography variant="body" color={theme.colors.textSecondary} align="center" style={styles.subtitle}>
        Select the currency you want to use for your primary balance and analytics.
      </Typography>

      <View style={styles.currencyList}>
        {CURRENCIES.map((c) => (
          <TouchableOpacity 
            key={c.code}
            style={[styles.currencyCard, selectedCurrency === c.code && styles.currencyCardActive]}
            onPress={() => setSelectedCurrency(c.code)}
          >
            <View style={styles.currencyInfo}>
              <Typography variant="h3">{c.symbol}</Typography>
              <View style={{ marginLeft: 16 }}>
                <Typography variant="h4">{c.code}</Typography>
                <Typography variant="caption" color={theme.colors.textSecondary}>{c.name}</Typography>
              </View>
            </View>
            {selectedCurrency === c.code && <Icon name="CheckCircle2" color={theme.colors.primary} size={24} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {step === 0 ? renderIntro() : renderCurrencySelect()}
      
      <View style={styles.footer}>
        <View style={styles.dotContainer}>
          <View style={[styles.dot, step === 0 && styles.dotActive]} />
          <View style={[styles.dot, step === 1 && styles.dotActive]} />
        </View>
        <Button
          title={step === 0 ? "Get Started" : "Finish Set Up"}
          onPress={nextStep}
          style={styles.mainButton}
        />
      </View>
    </SafeAreaView>
  );
};

const FeatureItem = ({ icon, text, theme, styles }: { icon: any, text: string, theme: any, styles: any }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Icon name={icon} size={20} color={theme.colors.primary} />
    </View>
    <Typography variant="body">{text}</Typography>
  </View>
);

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    color: theme.colors.text,
  },
  subtitle: {
    paddingHorizontal: 20,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  features: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureIcon: {
    marginRight: 16,
  },
  currencyList: {
    marginTop: 40,
    gap: 12,
  },
  currencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currencyCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '05',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: 20,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  mainButton: {
    height: 56,
  },
});
