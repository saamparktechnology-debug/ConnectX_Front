// src/lib/device.ts
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "connectx_device_id";

export async function getOrCreateDeviceId(): Promise<string> {
  try {
    const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (existing) return existing;
  } catch {
    // fall through
  }

  const fresh = buildDeviceId();
  try {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, fresh);
  } catch {
    // SecureStore unavailable — still return a value
  }
  return fresh;
}

function buildDeviceId(): string {
  const platform = Platform.OS;
  const rand = Math.random().toString(36).slice(2, 12);
  const time = Date.now().toString(36);
  return `${platform}-${time}-${rand}`.slice(0, 128);
}

export function getPlatform(): "ios" | "android" {
  return Platform.OS === "ios" ? "ios" : "android";
}
