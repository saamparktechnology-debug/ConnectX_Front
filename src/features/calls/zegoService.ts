import { env } from "@/config/env";

/**
 * ZEGOCLOUD configuration accessor.
 *
 * The AppID is public (safe to embed in the app).
 * The ServerSecret is NEVER used on mobile — tokens are minted by the backend
 * via POST /calls/:uuid/token and handed to us.
 */
export const zegoConfig = {
  get appId(): number {
    return env.ZEGO_APP_ID;
  },

  get isConfigured(): boolean {
    return env.ZEGO_APP_ID > 0;
  },
};

/**
 * Build a stable userID for ZEGOCLOUD. The backend uses the same convention
 * when minting tokens, so the IDs must match.
 */
export function zegoUserId(dbUserId: number | string): string {
  return String(dbUserId);
}

/**
 * Build a stable userName for display in the ZEGOCLOUD UI Kit.
 */
export function zegoUserName(nickname: string): string {
  return nickname.slice(0, 32) || "User";
}
