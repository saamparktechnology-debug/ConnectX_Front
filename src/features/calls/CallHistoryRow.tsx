import type { CallHistoryRow as CallHistoryRowType } from "@/api/calls";
import { callsApi } from "@/api/calls";
import { userMessage } from "@/api/errors";
import { useAuthStore } from "@/auth/authStore";
import { useCallStore } from "@/features/calls/callStore";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Avatar, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  call: CallHistoryRowType;
  onPress?: () => void;
  showNotify?: boolean;
};

export function CallHistoryRow({ call, onPress, showNotify }: Props) {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const viewer = useAuthStore((s) => s.user);
  const startOutgoing = useCallStore((s) => s.startOutgoing);

  const isOutgoing = call.direction === "outgoing";
  const isMissed = !isOutgoing && call.durationSeconds === 0;

  const iconName = isMissed
    ? "call-outline"
    : isOutgoing
      ? "arrow-up-circle-outline"
      : "arrow-down-circle-outline";
  const iconColor = isMissed
    ? colors.danger
    : isOutgoing
      ? colors.textMuted
      : colors.success;

  const date = new Date(call.startTime);
  const dateStr = date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const minutes = Math.floor(call.durationSeconds / 60);
  const seconds = call.durationSeconds % 60;
  const durationStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // ─── Notify mutation (female → male) ──────────────────────────────
  const notify = useMutation({
    mutationFn: async () => {
      const { post } = await import("@/api/client");
      return post<{ sent: number }>("/users/me/notify-online", {});
    },
    onSuccess: (res) => {
      showToast(
        res.sent > 0
          ? `Notified ${res.sent} caller${res.sent > 1 ? "s" : ""}`
          : "No recent callers to notify",
        "success",
      );
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  // ─── Call-back mutation (male → female) ───────────────────────────
  const callBack = useMutation({
    mutationFn: () => callsApi.initiate(call.peerUuid),
    onSuccess: (data) => {
      startOutgoing({
        sessionUuid: data.sessionUuid,
        roomId: data.roomId,
        peerNickname: data.receiverNickname,
        peerUuid: data.receiverUuid,
        peerAvatarUrl: call.peerAvatar,
        token: data.callerToken,
      });
      router.push({
        pathname: "/call/outgoing",
        params: { sessionUuid: data.sessionUuid },
      });
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  const showCallNow = viewer?.gender === "male" && call.peerIsFemale;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          paddingVertical: spacing.md,
          borderBottomColor: colors.divider,
          backgroundColor: pressed ? colors.surfacePressed : "transparent",
        },
      ]}
    >
      <View>
        <Avatar uri={call.peerAvatar} name={call.peerNickname} size={48} />
        {call.peerIsOnline ? (
          <View
            style={[
              styles.onlineDot,
              {
                backgroundColor: colors.online,
                borderColor: colors.surface,
              },
            ]}
          />
        ) : null}
      </View>

      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text
          variant="bodyStrong"
          numberOfLines={1}
          color={isMissed ? "danger" : "textPrimary"}
        >
          {call.peerNickname}
        </Text>

        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
        >
          <Ionicons name={iconName} size={12} color={iconColor} />
          <Text variant="small" color="textMuted" style={{ marginLeft: 4 }}>
            {dateStr} · {durationStr}
          </Text>
          {showCallNow ? (
            <>
              <View
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: colors.textMuted,
                  marginHorizontal: spacing.sm,
                }}
              />
              <Text
                variant="small"
                color={call.peerIsOnline ? "success" : "textMuted"}
              >
                {call.peerIsOnline ? "Online" : "Offline"}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        {showCallNow ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              if (callBack.isPending) return;
              if (!call.peerIsOnline) {
                showToast("Companion is offline right now", "warning");
                return;
              }
              callBack.mutate();
            }}
            hitSlop={8}
            disabled={callBack.isPending}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: call.peerIsOnline
                ? colors.primary
                : colors.surfaceRaised,
              alignItems: "center",
              justifyContent: "center",
              opacity: callBack.isPending ? 0.5 : 1,
            }}
          >
            <Ionicons
              name="call"
              size={16}
              color={call.peerIsOnline ? "#FFFFFF" : colors.textMuted}
            />
          </Pressable>
        ) : null}

        {showNotify ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              if (!notify.isPending) notify.mutate();
            }}
            hitSlop={8}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.primarySoft,
              alignItems: "center",
              justifyContent: "center",
              opacity: notify.isPending ? 0.5 : 1,
            }}
          >
            <Ionicons
              name="megaphone-outline"
              size={16}
              color={colors.primary}
            />
          </Pressable>
        ) : null}

        <View style={{ alignItems: "flex-end" }}>
          {isMissed ? (
            <Text variant="small" color="textMuted">
              No answer
            </Text>
          ) : (
            <>
              <Text
                variant="bodyStrong"
                color={isOutgoing ? "textPrimary" : "success"}
              >
                {isOutgoing ? `-₹${call.amount}` : `+₹${call.amount}`}
              </Text>
              <Text variant="small" color="textMuted" style={{ marginTop: 2 }}>
                {call.billedMinutes} min
              </Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
});
