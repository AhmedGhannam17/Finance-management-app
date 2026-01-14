import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { theme } from '../theme';
import { Icon } from '../components/Icon';
import { FABProvider } from '../context/FABContext';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Screens
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';

// Main Screens
import { AccountsScreen } from '../screens/AccountsScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ZakatScreen } from '../screens/ZakatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// Detail/Form Screens
import { AccountFormScreen } from '../screens/AccountFormScreen';
import { TransactionFormScreen } from '../screens/TransactionFormScreen';
import { CategoryFormScreen } from '../screens/CategoryFormScreen';
import { AccountTransactionsScreen } from '../screens/AccountTransactionsScreen';
import { ProfileEditScreen } from '../screens/ProfileEditScreen';
import { CategoryManagementScreen } from '../screens/CategoryManagementScreen';
import { ThemeSettingsScreen } from '../screens/ThemeSettingsScreen';

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            paddingTop: 12,
            elevation: 8,
          },
          tabBarLabelStyle: {
            ...theme.typography.caption,
            fontWeight: '600',
            marginBottom: 4,
          },
          tabBarItemStyle: {
            paddingTop: 8,
          },
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: any;

            if (route.name === 'Accounts') iconName = 'Wallet';
            else if (route.name === 'Transactions') iconName = 'History';
            else if (route.name === 'Zakat') iconName = 'Heart';
            else if (route.name === 'Settings') iconName = 'Settings';

            return (
              <View style={[focused ? {
                backgroundColor: theme.colors.primary + '15',
                padding: 8,
                borderRadius: 12,
              } : null]}>
                <Icon name={iconName} size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Accounts" component={AccountsScreen} />
        <Tab.Screen name="Transactions" component={TransactionsScreen} />
        <Tab.Screen name="Zakat" component={ZakatScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </View>
  );
};

/**
 * Main App Navigator
 */
export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme, mode } = useTheme();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer theme={{
      dark: mode === 'dark',
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.primary,
      }
    } as any}>
      <FABProvider>
        <Stack.Navigator screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right'
        }}>
          {!user ? (
            // Auth Stack
            <>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          ) : (
            // Main App Stack
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen
                name="AccountsList"
                component={AccountsScreen}
              />
              <Stack.Screen
                name="Categories"
                component={CategoriesScreen}
              />
              <Stack.Screen
                name="AccountForm"
                component={AccountFormScreen}
              />
              <Stack.Screen
                name="TransactionForm"
                component={TransactionFormScreen}
              />
              <Stack.Screen
                name="CategoryForm"
                component={CategoryFormScreen}
              />
              <Stack.Screen
                name="AccountTransactions"
                component={AccountTransactionsScreen}
              />
              <Stack.Screen
                name="ProfileEdit"
                component={ProfileEditScreen}
              />
              <Stack.Screen
                name="CategoryManagement"
                component={CategoryManagementScreen}
              />
              <Stack.Screen
                name="ThemeSettings"
                component={ThemeSettingsScreen}
              />
            </>
          )}
        </Stack.Navigator>
      </FABProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  activeIconBg: {
    backgroundColor: theme.colors.primary + '15',
    padding: 8,
    borderRadius: 12,
  },
});

