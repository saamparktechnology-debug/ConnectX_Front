import { getOrCreateDeviceId, getPlatform } from "@/lib/device";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPush(): Promise<string | null> {
  if (!Device.isDevice) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("incoming_call", {
      name: "Incoming Calls",
      importance: Notifications.AndroidImportance.MAX,
      sound: "ringtone.wav",
      vibrationPattern: [0, 500, 500, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
    await Notifications.setNotificationChannelAsync("default", {
      name: "Notifications",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return null;

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: undefined,
  }).catch(() => null);

  const token = tokenData?.data ?? null;
  if (!token) return null;

  const deviceId = await getOrCreateDeviceId();
  const platform = getPlatform();

  const { api } = await import("@/api/client");
  await api.post("/users/devices/push-token", {
    deviceId,
    platform,
    pushToken: token,
  });

  return token;
}
