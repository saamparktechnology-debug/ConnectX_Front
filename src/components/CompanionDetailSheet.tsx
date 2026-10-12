import { callsApi } from "@/api/calls";
import { userMessage } from "@/api/errors";
import type { DiscoverableFemale } from "@/api/users";
import { findLanguage } from "@/config/languages";
import { useCallStore } from "@/features/calls/callStore";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Avatar, Button, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type Props = {
  companion: DiscoverableFemale | null;
  visible: boolean;
  onClose: () => void;
};

export function CompanionDetailSheet({ companion, visible, onClose }: Props) {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const startOutgoing = useCallStore((s) => s.startOutgoing);

  const initiate = useMutation({
    mutationFn: () => callsApi.initiate(companion!.uuid),
    onSuccess: (data) => {
      startOutgoing({
        sessionUuid: data.sessionUuid,
        roomId: data.roomId,
        peerNickname: data.receiverNickname,
        peerUuid: data.receiverUuid,
        peerAvatarUrl: companion?.avatar_url ?? null,
        token: data.callerToken,
      });
      onClose();
      router.push({
        pathname: "/call/outgoing",
        params: { sessionUuid: data.sessionUuid },
      });
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  if (!companion) return null;

  const isOnline = Boolean(companion.is_online);
  const language = companion.primary_language
    ? (findLanguage(companion.primary_language)?.name ??
      companion.primary_language)
    : "Hindi";
  const publicId = companion.public_id ?? "—";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        onPress={onClose}
      >
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius["2xl"],
              borderTopRightRadius: radius["2xl"],
              paddingHorizontal: spacing.lg,
              paddingTop: spacing.lg,
              paddingBottom: spacing["2xl"],
            },
          ]}
          onPress={() => {}}
        >
          <View
            style={[styles.handle, { backgroundColor: colors.borderStrong }]}
          />

          <View style={{ alignItems: "center", marginTop: spacing.lg }}>
            <Avatar
              uri={companion.avatar_url}
              name={companion.nickname}
              size={96}
              presence={isOnline ? "online" : "offline"}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: spacing.md,
              }}
            >
              <Text variant="h2">{companion.nickname}</Text>
              <View
                style={{
                  marginLeft: 8,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: colors.success,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              </View>
            </View>

            <View
              style={{
                marginTop: 4,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: colors.primarySoft,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontWeight: "800",
                  letterSpacing: 1,
                }}
              >
                {publicId}
              </Text>
            </View>

            {isOnline ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.success,
                    marginRight: 6,
                  }}
                />
                <Text variant="caption" color="success">
                  Online now
                </Text>
              </View>
            ) : (
              <Text
                variant="caption"
                color="textMuted"
                style={{ marginTop: spacing.sm }}
              >
                Offline
              </Text>
            )}
          </View>

          <View
            style={[
              styles.infoRow,
              { marginTop: spacing.xl, marginBottom: spacing.xl },
            ]}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text variant="small" color="textMuted">
                Language
              </Text>
              <Text variant="bodyStrong" style={{ marginTop: 2 }}>
                {language}
              </Text>
            </View>
            <View
              style={{ width: 1, height: 32, backgroundColor: colors.divider }}
            />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text variant="small" color="textMuted">
                Rate
              </Text>
              <Text variant="bodyStrong" style={{ marginTop: 2 }}>
                ₹3/min
              </Text>
            </View>
          </View>

          {isOnline ? (
            <Button
              label="Call now"
              variant="rose"
              loading={initiate.isPending}
              onPress={() => initiate.mutate()}
            />
          ) : (
            <Button
              label="Companion is offline"
              variant="ghost"
              disabled
              onPress={() => {}}
            />
          )}

          <Pressable
            onPress={onClose}
            style={{
              marginTop: spacing.md,
              paddingVertical: spacing.md,
              alignItems: "center",
            }}
          >
            <Text variant="body" color="textMuted">
              Close
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end" },
  sheet: { minHeight: 380 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center" },
  infoRow: { flexDirection: "row", alignItems: "center" },
});
