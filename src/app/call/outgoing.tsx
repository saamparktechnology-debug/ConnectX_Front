import { callsApi } from "@/api/calls";
import { userMessage } from "@/api/errors";
import { useCallStore } from "@/features/calls/callStore";
import { useCallSocketEvents } from "@/features/calls/useCallSocketEvents";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Avatar, Button, Screen, Text } from "@/ui";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

const RING_TIMEOUT_SEC = 60;

export default function OutgoingCallScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const call = useCallStore((s) => s.call);
  const clear = useCallStore((s) => s.clear);
  const event = useCallSocketEvents(call?.sessionUuid);
  const endedRef = useRef(false);

  const [secondsLeft, setSecondsLeft] = useState(RING_TIMEOUT_SEC);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        const next = Math.max(0, s - 1);
        if (next === 0 && !endedRef.current) {
          endedRef.current = true;
          callsApi.end(call?.sessionUuid ?? "", "user_ended").catch(() => {});
          clear();
          showToast("Companion did not answer", "warning");
          router.back();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [clear, router, call?.sessionUuid]);

  useEffect(() => {
    if (!event || !call || endedRef.current) return;

    if (event.type === "accepted") {
      endedRef.current = true;
      (async () => {
        try {
          const tokenData = await callsApi.getRoomToken(call.sessionUuid);
          useCallStore.getState().markAccepted(tokenData.token);
          router.replace({
            pathname: "/call/active",
            params: {
              sessionUuid: call.sessionUuid,
              roomId: call.roomId,
              token: tokenData.token,
              peerNickname: call.peerNickname,
            },
          });
        } catch (err) {
          showToast(userMessage(err), "error");
          clear();
          router.back();
        }
      })();
      return;
    }

    if (event.type === "rejected") {
      endedRef.current = true;
      showToast("Call was declined", "warning");
      clear();
      router.back();
      return;
    }

    if (event.type === "ended") {
      endedRef.current = true;
      showToast("Call ended", "warning");
      clear();
      router.back();
    }
  }, [event, call, clear, router]);

  const handleCancel = async () => {
    if (!call || endedRef.current) return;
    endedRef.current = true;
    try {
      await callsApi.end(call.sessionUuid, "user_ended");
    } catch {
      /* best effort */
    }
    clear();
    router.back();
  };

  const progress = Math.max(0, Math.min(1, secondsLeft / RING_TIMEOUT_SEC));

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Avatar
          uri={call?.peerAvatarUrl}
          name={call?.peerNickname ?? "Companion"}
          size={120}
        />

        <Text variant="h2" style={{ marginTop: spacing.xl }}>
          {call?.peerNickname ?? "Companion"}
        </Text>

        <Text
          variant="body"
          color="textSecondary"
          style={{ marginTop: spacing.sm }}
        >
          Calling…
        </Text>

        <View
          style={{
            marginTop: spacing["2xl"],
            width: 200,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              backgroundColor: colors.rose,
            }}
          />
        </View>

        <Text
          variant="small"
          color="textMuted"
          style={{ marginTop: spacing.sm }}
        >
          Ringing · {secondsLeft}s
        </Text>

        <View style={{ marginTop: spacing["3xl"], width: "100%" }}>
          <Button label="Cancel" variant="outline" onPress={handleCancel} />
        </View>
      </View>
    </Screen>
  );
}
