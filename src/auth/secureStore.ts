import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_KEY = "connect24x_access_token";
const REFRESH_KEY = "connect24x_refresh_token";
const USER_KEY = "connect24x_user_snapshot";

export type StoredUser = {
  id: number;
  uuid: string;
  publicId?: string | null;
  phone: string;
  gender: "male" | "female";
  nickname: string;
  verificationStatus: "unverified" | "pending" | "approved" | "rejected";
  verificationRejectionReason?: string | null;
  verificationRejectionNote?: string | null;
  walletBalance: string;
  isOnline: boolean;
  avatarUrl?: string | null;
  onboardingCompleted?: boolean;
  primaryLanguage?: string | null;
  termsAcceptedAt?: string | null;
  channelsAcknowledgedAt?: string | null;
};

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      await AsyncStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const tokenStore = {
  async saveTokens(access: string, refresh: string) {
    await Promise.all([
      storage.setItem(ACCESS_KEY, access),
      storage.setItem(REFRESH_KEY, refresh),
    ]);
  },
  async getAccess() {
    return storage.getItem(ACCESS_KEY);
  },
  async getRefresh() {
    return storage.getItem(REFRESH_KEY);
  },
  async clear() {
    await Promise.all([
      storage.deleteItem(ACCESS_KEY),
      storage.deleteItem(REFRESH_KEY),
      storage.deleteItem(USER_KEY),
    ]);
  },
};

export const userSnapshotStore = {
  async save(user: StoredUser) {
    await storage.setItem(USER_KEY, JSON.stringify(user));
  },
  async load(): Promise<StoredUser | null> {
    const raw = await storage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },
  async clear() {
    await storage.deleteItem(USER_KEY);
  },
};
