const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const ZEGO_APP_ID_RAW = process.env.EXPO_PUBLIC_ZEGO_APP_ID;

if (!API_BASE_URL) {
  console.warn(
    "[config] EXPO_PUBLIC_API_BASE_URL is not set. " +
      "Add it to .env — the app will fail all network calls until then.",
  );
}

if (!ZEGO_APP_ID_RAW) {
  console.warn(
    "[config] EXPO_PUBLIC_ZEGO_APP_ID is not set. " +
      "Voice calls will fail to join the audio room.",
  );
}

const ZEGO_APP_ID = ZEGO_APP_ID_RAW ? Number(ZEGO_APP_ID_RAW) : 0;

export const env = {
  API_BASE_URL: API_BASE_URL ?? "http://localhost:5000/api/v1",
  ZEGO_APP_ID,
  TIMEOUT_MS: 20000,
} as const;
