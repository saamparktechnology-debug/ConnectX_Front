// src/app/call/active.tsx
import { callsApi } from "@/api/calls";
import { useCallStore } from "@/features/calls/callStore";
import { useCallSocketEvents } from "@/features/calls/useCallSocketEvents";
import { ZegoCallRoom } from "@/features/calls/ZegoCallRoom";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
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

  const finalizeCall = useCallback(
    async (reason: "user_ended" | "network_drop" = "user_ended") => {
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
    },
    [params.sessionUuid, call?.role, clear, router],
  );

  // Safety net: finalize on unmount if nothing else did.
  useEffect(() => {
    return () => {
      if (!endedRef.current) {
        endedRef.current = true;
        callsApi.end(params.sessionUuid, "user_ended").catch(() => {});
        clear();
      }
    };
  }, [params.sessionUuid, clear]);

  // Socket fallback: peer hung up.
  useEffect(() => {
    if (!socketEvent || socketEvent.type !== "ended") return;
    if (endedRef.current) return;
    showToast("Call ended by other party", "warning");
    finalizeCall("network_drop");
  }, [socketEvent, finalizeCall]);

  const handleCallEnded = useCallback(() => {
    finalizeCall("user_ended");
  }, [finalizeCall]);

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
        <ActivityIndicator size="large" color={colors.primary} />
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
        onCallEnded={handleCallEnded}
      />
      {/* Non-blocking DND hint — hidden from ZEGO's UI layering */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 90,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="notifications-off-outline"
            size={12}
            color="#FFFFFF"
          />
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 11,
              marginLeft: 6,
              fontWeight: "600",
            }}
          >
            Tip: Enable Do Not Disturb for a quieter call
          </Text>
        </View>
      </View>
    </View>
  );
}
