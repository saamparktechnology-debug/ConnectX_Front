import { userMessage } from "@/api/errors";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/auth/authStore";
import { AvatarPicker } from "@/components/AvatarPicker";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Card, Input, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const queryClient = useQueryClient();

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatarUrl ?? null);

  const nicknameValid =
    nickname.trim().length >= 2 && nickname.trim().length <= 64;
  const changed =
    nickname.trim() !== user?.nickname || avatar !== user?.avatarUrl;

  const save = useMutation({
    mutationFn: () =>
      usersApi.updateMe({
        nickname: nickname.trim(),
        avatarUrl: avatar,
      }),
    onSuccess: (data) => {
      updateUser({
        nickname: data.nickname,
        avatarUrl: data.avatarUrl,
      });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      showToast("Profile updated", "success");
      router.back();
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  if (!user) return null;

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
          <View style={{ marginBottom: spacing.xl }}>
            <Text variant="display">Edit profile</Text>
          </View>

          {/* Avatar */}
          <Text variant="h3" style={{ marginBottom: spacing.md }}>
            Your avatar
          </Text>

          <AvatarPicker
            nickname={nickname}
            value={avatar}
            onChange={setAvatar}
          />

          {/* Nickname */}
          <View style={{ marginTop: spacing.xl }}>
            <Input
              label="Nickname"
              value={nickname}
              onChangeText={setNickname}
              maxLength={64}
              placeholder="How should people see you?"
              hint="2–64 characters."
            />
          </View>

          {/* Phone — read-only + link to change */}
          <Text
            variant="h3"
            style={{ marginTop: spacing.lg, marginBottom: spacing.md }}
          >
            Phone number
          </Text>

          <Card>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={colors.textSecondary}
              />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text variant="body">{user.phone}</Text>
                <Text variant="small" color="textMuted">
                  Used to log in and receive calls
                </Text>
              </View>

              <Pressable
                onPress={() => router.push("/profile/change-phone" as never)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                }}
              >
                <Text variant="small" color="primary">
                  Change
                </Text>
              </Pressable>
            </View>
          </Card>

          {/* Save */}
          <View style={{ marginTop: spacing.xl }}>
            <Button
              label="Save changes"
              variant="rose"
              loading={save.isPending}
              disabled={!nicknameValid || !changed}
              onPress={() => save.mutate()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({});
