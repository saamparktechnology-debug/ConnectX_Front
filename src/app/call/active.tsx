import { callsApi } from "@/api/calls";
import { useCallStore } from "@/features/calls/callStore";
import { useCallSocketEvents } from "@/features/calls/useCallSocketEvents";
import { ZegoCallRoom } from "@/features/calls/ZegoCallRoom";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";

export default function ActiveCallScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    sessionUuid: string;
    roomId: string;
    token: string;
    peerNickname: string;
  }>();

  const call = useCallStore((s) => s.call);
  const setActive = useCallStore((s) => s.setActive);
  const clear = useCallStore((s) => s.clear);

  const endedRef = useRef(false);
  const socketEvent = useCallSocketEvents(params.sessionUuid);

  useEffect(() => {
    setActive();
  }, [setActive]);

  const finalizeCall = async (
    reason: "user_ended" | "network_drop" = "user_ended",
  ) => {
    if (endedRef.current) return;
    endedRef.current = true;

    try {
      const result = await callsApi.end(params.sessionUuid, reason);
      console.log("[call] ended:", result);
    } catch (err) {
      console.log("[call] end error:", err);
    }

    clear();

    if (call?.role === "caller") {
      router.replace("/rating/pending");
    } else {
      router.replace("/(tabs)/home");
    }
  };

  // Socket fallback in case ZEGOCLOUD's own callback doesn't fire
  useEffect(() => {
    if (!socketEvent || socketEvent.type !== "ended") return;
    if (endedRef.current) return;
    showToast("Call ended by other party", "warning");
    finalizeCall("network_drop");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketEvent]);

  if (!params.sessionUuid || !params.roomId || !params.token) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.rose} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ZegoCallRoom
        sessionUuid={params.sessionUuid}
        roomId={params.roomId}
        token={params.token}
        peerNickname={call?.peerNickname ?? params.peerNickname ?? "Companion"}
        onCallEnded={() => {
          finalizeCall("user_ended");
        }}
      />
    </View>
  );
}
