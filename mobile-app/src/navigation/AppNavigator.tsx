import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { theme } from '../theme';
import { Icon } from '../components/Icon';
import { FloatingActionButton } from '../components/FloatingActionButton';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Main Tab Navigator
 */
const MainTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textTertiary,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 0,
            paddingBottom: insets.bottom + 8,
            paddingTop: 12,
            height: 64 + insets.bottom,
            ...theme.shadows.lg,
          },
          tabBarLabelStyle: {
            ...theme.typography.caption,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: any;

            if (route.name === 'Accounts') iconName = 'Wallet';
            else if (route.name === 'Transactions') iconName = 'History';
            else if (route.name === 'Zakat') iconName = 'Heart';
            else if (route.name === 'Settings') iconName = 'Settings';

            return (
              <View style={focused ? styles.activeIconBg : null}>
                <Icon name={iconName} size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
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
      <FloatingActionButton />
    </View>
  );
};

/**
 * Main App Navigator
 */
export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
              options={{ headerShown: true, title: 'Accounts' }}
            />
            <Stack.Screen
              name="Categories"
              component={CategoriesScreen}
              options={{ headerShown: true, title: 'Categories' }}
            />
            <Stack.Screen
              name="AccountForm"
              component={AccountFormScreen}
              options={{ headerShown: true, title: 'Account' }}
            />
            <Stack.Screen
              name="TransactionForm"
              component={TransactionFormScreen}
              options={{ headerShown: true, title: 'Transaction' }}
            />
            <Stack.Screen
              name="CategoryForm"
              component={CategoryFormScreen}
              options={{ headerShown: true, title: 'Category' }}
            />
            <Stack.Screen
              name="AccountTransactions"
              component={AccountTransactionsScreen}
              options={{ headerShown: true, title: 'Account Transactions' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  activeIconBg: {
    backgroundColor: theme.colors.primary + '10',
    padding: 8,
    borderRadius: 12,
  },
});

