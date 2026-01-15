import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  /**
   * Request permissions and return boolean indicating success
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      // On emulator, we can still use local notifications in some cases, 
      // but let's be safe and return true for permissions if not rejected.
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  },

  /**
   * Schedule a local notification
   */
  async scheduleNotification(title: string, body: string, seconds: number = 2) {
    // Clear any existing notifications first to prevent "spam"
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: { data: 'goes here' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    });
  },

  /**
   * Schedule a "Wallet" themed notification daily at 10 PM
   */
  async scheduleWalletReminder() {
    // Clear ALL existing scheduled notifications before scheduling the daily one
    await this.cancelAllNotifications();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💰 Amanah Wallet',
        body: 'Don\'t forget to log your expenses for today! Keep your finances in check.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 22, // 10 PM
        minute: 0,
      } as any, // TypeScript sometimes complains about the trigger structure
    });
  },

  /**
   * Stop all notifications
   */
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[NotificationService] All scheduled notifications cancelled');
  }
};
