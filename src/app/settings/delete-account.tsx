import { userMessage } from "@/api/errors";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/auth/authStore";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Card, Input, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const logout = useAuthStore((s) => s.logout);

  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  const del = useMutation({
    mutationFn: () => usersApi.deleteAccount(reason, confirmText.trim()),
    onSuccess: async () => {
      showToast("Account deleted", "success");
      await logout();
      router.replace("/(auth)/phone");
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingVertical: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: spacing.xl,
            }}
          >
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons
                name="chevron-back"
                size={26}
                color={colors.textPrimary}
              />
            </Pressable>
            <Text variant="h2" style={{ marginLeft: spacing.md }}>
              Delete account
            </Text>
          </View>

          {/* Warning */}
          <Card
            style={{
              marginBottom: spacing.xl,
              borderColor: colors.danger,
              backgroundColor: colors.dangerSoft,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Ionicons
                name="warning-outline"
                size={24}
                color={colors.danger}
              />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text variant="bodyStrong" color="danger">
                  This action is permanent
                </Text>
                <Text
                  variant="body"
                  color="textSecondary"
                  style={{ marginTop: spacing.xs, lineHeight: 22 }}
                >
                  Deleting your account will:
                </Text>
                <View style={{ marginTop: spacing.sm, gap: 4 }}>
                  <Bullet text="Remove your profile from discovery" />
                  <Bullet text="Cancel any pending withdrawals" />
                  <Bullet text="Log you out of all devices" />
                  <Bullet text="Prevent you from signing in again with this number" />
                </View>
              </View>
            </View>
          </Card>

          {/* Reason (optional) */}
          <Input
            label="Reason (optional)"
            value={reason}
            onChangeText={setReason}
            maxLength={200}
            placeholder="Why are you leaving?"
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />

          {/* Confirmation */}
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginBottom: spacing.sm }}
          >
            Type <Text variant="bodyStrong">DELETE</Text> to confirm:
          </Text>

          <Input
            value={confirmText}
            onChangeText={setConfirmText}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="DELETE"
          />

          <View style={{ marginTop: spacing.xl }}>
            <Button
              label={del.isPending ? "Deleting…" : "Delete my account"}
              variant="danger"
              loading={del.isPending}
              disabled={!canDelete}
              onPress={() => del.mutate()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Bullet({ text }: { text: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.danger,
          marginTop: 9,
          marginRight: spacing.sm,
        }}
      />
      <Text variant="body" color="textSecondary" style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
