import { useAuthStore } from "@/auth/authStore";
import { useTheme } from "@/theme";
import { Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { zegoConfig, zegoUserId, zegoUserName } from "./zegoService";

// Dynamic import so the module loads only when a call is mounted.
// This avoids a hard import error if the package isn't present yet.
let ZegoUIKitPrebuilt: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("@zegocloud/zego-uikit-prebuilt-call-rn");
  ZegoUIKitPrebuilt = mod.ZegoUIKitPrebuilt;
} catch {
  ZegoUIKitPrebuilt = null;
}

type Props = {
  sessionUuid: string;
  roomId: string;
  token: string;
  peerNickname: string;
  onCallEnded: () => void;
};

export function ZegoCallRoom({
  sessionUuid,
  roomId,
  token,
  peerNickname,
  onCallEnded,
}: Props) {
  const { colors, spacing } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);

  // Guard against onCallEnded firing multiple times
  const endedRef = useRef(false);
  const handleEnd = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    onCallEnded();
  };

  useEffect(() => {
    if (!zegoConfig.isConfigured) {
      setError(
        "ZEGOCLOUD is not configured. Add EXPO_PUBLIC_ZEGO_APP_ID to .env.",
      );
    }
    if (!ZegoUIKitPrebuilt) {
      setError(
        "ZEGOCLOUD UI Kit not installed. Run: npx expo install @zegocloud/zego-uikit-prebuilt-call-rn",
      );
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

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.rose} />
      </View>
    );
  }

  const myUserId = zegoUserId(user.id);
  const myUserName = zegoUserName(user.nickname);

  // The ZEGOCLOUD UI Kit mounts full-screen. It handles:
  //  - Joining the room with the given token
  //  - Audio routing, mute, speaker toggle
  //  - End-call button (which we intercept via onCallEnd)
  //  - Peer-disconnect detection
  return (
    <ZegoUIKitPrebuilt
      appID={zegoConfig.appId}
      appSign="" // Not used in token mode
      userID={myUserId}
      userName={myUserName}
      callID={roomId}
      token={token}
      scenario={{ mode: "One-on-One Voice Call" }}
      config={{
        // Prebuilt UI config — the important bits
        turnOnCameraWhenJoining: false,
        turnOnMicrophoneWhenJoining: true,
        useSpeakerWhenJoining: true,
        showMyCameraToggleButton: false,
        showAudioVideoSettingsButton: false,
        showScreenSharingButton: false,
        showTextChat: false,
        showUserList: false,
        showLayoutButton: false,
        showSwitchCameraButton: false,
        showSwitchAudioOutputButton: true,
        showMinimizingButton: false,
        showLeaveButton: true,
      }}
      onCallEnd={() => {
        console.log("[zego] onCallEnd fired");
        handleEnd();
      }}
      onLeaveRoom={() => {
        console.log("[zego] onLeaveRoom fired");
        handleEnd();
      }}
      onUserLeave={(users: any[]) => {
        console.log("[zego] onUserLeave:", users);
        // When the peer leaves, ZEGOCLOUD fires this. We end the call.
        if (users && users.length > 0) {
          handleEnd();
        }
      }}
    />
  );
}
