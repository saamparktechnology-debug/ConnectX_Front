import { callsApi } from "@/api/calls";
import { userMessage } from "@/api/errors";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Avatar, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useCallStore } from "./callStore";
import { useIncomingRingtone } from "./useIncomingRingtone";

export function IncomingCallOverlay() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const markAccepted = useCallStore((s) => s.markAccepted);
  const clear = useCallStore((s) => s.clear);
  const phase = useCallStore((s) => s.phase);
  const call = useCallStore((s) => s.call);

  const [secondsLeft, setSecondsLeft] = useState(60);
  const [busy, setBusy] = useState(false);

  useIncomingRingtone();

  useEffect(() => {
    if (phase === "incoming") setSecondsLeft(60);
  }, [phase, call?.sessionUuid]);

  useEffect(() => {
    if (phase !== "incoming" || !call) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        const next = Math.max(0, s - 1);
        if (next === 0) {
          callsApi.end(call.sessionUuid, "user_ended").catch(() => {});
          clear();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, call, clear]);

  const handleAccept = async () => {
    if (!call || busy) return;
    setBusy(true);
    try {
      await callsApi.accept(call.sessionUuid);
      const tokenData = await callsApi.getRoomToken(call.sessionUuid);
      markAccepted(tokenData.token);
      router.push({
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
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!call || busy) return;
    setBusy(true);
    try {
      await callsApi.reject(call.sessionUuid);
    } catch {
      /* best effort */
    } finally {
      clear();
      setBusy(false);
    }
  };

  if (phase !== "incoming" || !call) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderRadius: radius["2xl"],
              padding: spacing["2xl"],
            },
          ]}
        >
          <Avatar uri={call.peerAvatarUrl} name={call.peerNickname} size={96} />

          <Text variant="h2" style={{ marginTop: spacing.lg }}>
            {call.peerNickname}
          </Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginTop: spacing.xs }}
          >
            Incoming call · {secondsLeft}s
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: spacing.lg,
              marginTop: spacing["2xl"],
            }}
          >
            <Pressable
              onPress={handleReject}
              disabled={busy}
              style={[styles.btnCircle, { backgroundColor: colors.danger }]}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </Pressable>

            <Pressable
              onPress={handleAccept}
              disabled={busy}
              style={[styles.btnCircle, { backgroundColor: colors.success }]}
            >
              <Ionicons name="call" size={26} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  btnCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
