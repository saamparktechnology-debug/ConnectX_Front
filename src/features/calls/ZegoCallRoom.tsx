// src/features/calls/ZegoCallRoom.tsx
import { useAuthStore } from "@/auth/authStore";
import { useTheme } from "@/theme";
import { Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  View,
} from "react-native";
import { zegoConfig, zegoUserId, zegoUserName } from "./zegoService";

let ZegoUIKitPrebuiltCall: any = null;
let ONE_ON_ONE_VOICE_CALL_CONFIG: any = {};
let ZegoMenuBarButtonName: any = {};
let zegoLoadError: string | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@zegocloud/zego-uikit-prebuilt-call-rn");
  ZegoUIKitPrebuiltCall = mod.ZegoUIKitPrebuiltCall ?? null;
  ONE_ON_ONE_VOICE_CALL_CONFIG = mod.ONE_ON_ONE_VOICE_CALL_CONFIG ?? {};
  ZegoMenuBarButtonName = mod.ZegoMenuBarButtonName ?? {};
  if (!ZegoUIKitPrebuiltCall) {
    zegoLoadError = "ZegoUIKitPrebuiltCall export missing";
  }
} catch (err) {
  zegoLoadError =
    err instanceof Error
      ? err.message
      : "ZEGOCLOUD native module not linked in this build";
}

type Props = {
  sessionUuid: string;
  roomId: string;
  token?: string;
  peerNickname: string;
  onCallEnded: () => void;
};

export function ZegoCallRoom({
  sessionUuid,
  roomId,
  peerNickname,
  onCallEnded,
}: Props) {
  const { colors, spacing } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);
  const [micReady, setMicReady] = useState(Platform.OS !== "android");
  const endedRef = useRef(false);

  const handleEnd = useCallback(
    (from: string) => {
      if (endedRef.current) return;
      endedRef.current = true;
      console.log(`[zego] handleEnd from ${from}`);
      onCallEnded();
    },
    [onCallEnded],
  );

  useEffect(() => {
    if (Platform.OS !== "android") {
      setMicReady(true);
      return;
    }
    (async () => {
      try {
        const res = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone",
            message: "Connect24x needs microphone access for voice calls.",
            buttonPositive: "Allow",
            buttonNegative: "Cancel",
          },
        );
        setMicReady(res === PermissionsAndroid.RESULTS.GRANTED);
      } catch {
        setMicReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!zegoConfig.isConfigured) {
      setError(
        `ZEGOCLOUD AppID or 64-char AppSign missing (appSign length: ${zegoConfig.appSign.length}).`,
      );
      return;
    }
    if (!ZegoUIKitPrebuiltCall) {
      setError(zegoLoadError ?? "ZEGOCLOUD UI Kit unavailable");
    }
  }, []);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.xl,
          backgroundColor: colors.bg,
        }}
      >
        <Ionicons name="warning-outline" size={48} color={colors.danger} />
        <Text
          variant="h3"
          style={{ marginTop: spacing.lg, textAlign: "center" }}
        >
          Cannot start call
        </Text>
        <Text
          variant="body"
          color="textSecondary"
          style={{ marginTop: spacing.sm, textAlign: "center" }}
        >
          {error}
        </Text>
      </View>
    );
  }

  if (!user || !ZegoUIKitPrebuiltCall || !micReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const Z = ZegoUIKitPrebuiltCall;

  return (
    <Z
      appID={zegoConfig.appId}
      appSign={zegoConfig.appSign}
      userID={zegoUserId(user.id)}
      userName={zegoUserName(user.nickname)}
      callID={roomId}
      config={{
        ...ONE_ON_ONE_VOICE_CALL_CONFIG,
        turnOnCameraWhenJoining: false,
        turnOnMicrophoneWhenJoining: true,
        useSpeakerWhenJoining: true,
        bottomMenuBarConfig: {
          ...ONE_ON_ONE_VOICE_CALL_CONFIG?.bottomMenuBarConfig,
          buttons: [
            ZegoMenuBarButtonName.toggleMicrophoneButton,
            ZegoMenuBarButtonName.switchAudioOutputButton,
            ZegoMenuBarButtonName.hangUpButton,
          ].filter((b) => b !== undefined),
          maxCount: 3,
        },
        onCallEnd: (callID: string, reason: any, duration: number) => {
          console.log("[zego] onCallEnd fired", { callID, reason, duration });
          handleEnd("onCallEnd");
        },
        onHangUp: () => {
          console.log("[zego] onHangUp fired");
          handleEnd("onHangUp");
        },
        onOnlySelfInRoom: () => {
          console.log("[zego] onOnlySelfInRoom fired");
          handleEnd("onOnlySelfInRoom");
        },
      }}
    />
  );
}
