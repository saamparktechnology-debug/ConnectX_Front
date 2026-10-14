// src/features/calls/zegoService.ts
import { env } from "@/config/env";

const RAW_APP_SIGN = (
  process.env.EXPO_PUBLIC_ZEGO_APP_SIGN ||
  (env as any).ZEGO_APP_SIGN ||
  ""
).trim();

export const zegoConfig = {
  get appId(): number {
    return Number(env.ZEGO_APP_ID);
  },

  get appSign(): string {
    return RAW_APP_SIGN;
  },

  get isConfigured(): boolean {
    return Number(env.ZEGO_APP_ID) > 0 && RAW_APP_SIGN.length === 64;
  },
};

export function zegoUserId(dbUserId: number | string): string {
  return String(dbUserId);
}

export function zegoUserName(nickname: string): string {
  return nickname.slice(0, 32) || "User";
}
