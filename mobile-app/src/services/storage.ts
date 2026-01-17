import * as SecureStore from 'expo-secure-store';

/**
 * Storage utility for persisting user preferences and app state
 */
export const storageService = {
  // Notification preferences
  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    await SecureStore.setItemAsync('notificationsEnabled', String(enabled));
  },

  async getNotificationsEnabled(): Promise<boolean> {
    const value = await SecureStore.getItemAsync('notificationsEnabled');
    return value === 'true';
  },

  // Zakat prices
  async setZakatPrices(goldPrice: string, silverPrice: string): Promise<void> {
    await SecureStore.setItemAsync('zakatGoldPrice', goldPrice);
    await SecureStore.setItemAsync('zakatSilverPrice', silverPrice);
  },

  async getZakatPrices(): Promise<{ goldPrice: string; silverPrice: string }> {
    const goldPrice = await SecureStore.getItemAsync('zakatGoldPrice');
    const silverPrice = await SecureStore.getItemAsync('zakatSilverPrice');
    return {
      goldPrice: goldPrice || '6000',
      silverPrice: silverPrice || '80',
    };
  },
};
