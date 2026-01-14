import * as SecureStore from 'expo-secure-store';
import { apiService } from './api';

/**
 * Auth Service - Simple username/password authentication
 */
export const authService = {
  /**
   * Sign up a new user
   */
  signUp: async (username: string, password: string, name?: string) => {
    const response = await apiService.auth.signUp(username, password, name);
    const token = response.data.token;
    if (token) {
      await SecureStore.setItemAsync('auth_token', token);
    }
    return response.data;
  },

  /**
   * Sign in an existing user
   */
  signIn: async (username: string, password: string) => {
    const response = await apiService.auth.signIn(username, password);
    const token = response.data.token;
    if (token) {
      await SecureStore.setItemAsync('auth_token', token);
    }
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: { name?: string; username?: string }) => {
    const response = await apiService.auth.updateProfile(data);
    return response.data;
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    try {
      await apiService.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_profile');
    }
  },

  /**
   * Get stored auth token
   */
  getToken: async (): Promise<string | null> => {
    return await SecureStore.getItemAsync('auth_token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const token = await SecureStore.getItemAsync('auth_token');
    return !!token;
  },

  /**
   * Store user profile locally
   */
  storeUser: async (user: any) => {
    await SecureStore.setItemAsync('user_profile', JSON.stringify(user));
  },

  /**
   * Get stored user profile
   */
  getStoredUser: async () => {
    const userStr = await SecureStore.getItemAsync('user_profile');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Remove stored user profile
   */
  removeUser: async () => {
    await SecureStore.deleteItemAsync('user_profile');
  },
};
