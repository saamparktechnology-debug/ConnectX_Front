import { authApi } from "@/api/auth";
import { userMessage } from "@/api/errors";
import { useAuthStore } from "@/auth/authStore";
import { StoredUser } from "@/auth/secureStore";
import { PRESET_AVATARS } from "@/config/avatars";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

export default function AvatarScreen() {
  const router = useRouter();
  const { spacing, colors, radius } = useTheme();
  const params = useLocalSearchParams<{
    phone: string;
    deviceId: string;
    onboardingToken: string;
    gender: "male" | "female";
    nickname: string;
    birthYear: string;
  }>();

  const isFemale = params.gender === "female";
  const setSession = useAuthStore((s) => s.setSession);

  const [avatar, setAvatar] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: () =>
      authApi.completeSignup({
        onboardingToken: params.onboardingToken,
        gender: params.gender,
        nickname: params.nickname,
        birthYear:
          isFemale && params.birthYear ? parseInt(params.birthYear, 10) : null,
        avatarUrl: avatar,
      }),
    onSuccess: async (data) => {
      const stored: StoredUser = {
        id: data.user.id,
        uuid: data.user.uuid,
        publicId: data.user.publicId,
        phone: data.user.phone,
        gender: data.user.gender ?? params.gender,
        nickname: data.user.nickname ?? params.nickname,
        avatarUrl: data.user.avatarUrl ?? avatar,
        verificationStatus: data.user.verificationStatus ?? "unverified",
        walletBalance: data.user.walletBalance ?? "0.00",
        isOnline: data.user.isOnline ?? false,
        onboardingCompleted:
          data.user.gender === "male" || !isFemale
            ? true
            : Boolean(data.user.onboardingCompleted),
        primaryLanguage: data.user.primaryLanguage ?? null,
        termsAcceptedAt: data.user.termsAcceptedAt ?? null,
        channelsAcknowledgedAt: data.user.channelsAcknowledgedAt ?? null,
      };

      await setSession({
        user: stored,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      if (isFemale) {
        router.replace("/(onboarding)/language" as never);
      } else {
        router.replace("/(tabs)/home");
      }
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  const initial = params.nickname.trim().slice(0, 1).toUpperCase();

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.xl }}>
        <View style={{ marginBottom: spacing["2xl"] }}>
          <Text variant="display">Pick an avatar</Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginTop: spacing.sm }}
          >
            Choose the color you like. You can change this later.
          </Text>
        </View>

        {/* Big preview */}
        <View style={{ alignItems: "center", marginBottom: spacing.xl }}>
          {(() => {
            const presetId = avatar?.replace("preset:", "");
            const preset = PRESET_AVATARS.find((p) => p.id === presetId);
            return (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: preset?.bg ?? colors.surfaceRaised,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 48,
                    fontWeight: "800",
                    color: preset?.fg ?? colors.textPrimary,
                  }}
                >
                  {initial}
                </Text>
              </View>
            );
          })()}
        </View>

        {/* Swatch grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: spacing.md,
            marginBottom: spacing.xl,
          }}
        >
          {PRESET_AVATARS.map((p) => {
            const selected = avatar === `preset:${p.id}`;
            return (
              <Pressable
                key={p.id}
                onPress={() => setAvatar(`preset:${p.id}`)}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: p.bg,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: selected ? 3 : 0,
                  borderColor: selected ? colors.rose : "transparent",
                }}
              >
                <Text style={{ fontSize: 22, fontWeight: "800", color: p.fg }}>
                  {initial}
                </Text>
                {selected ? (
                  <View
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: colors.rose,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: colors.surface,
                    }}
                  >
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Button
          label={submit.isPending ? "Creating account…" : "Continue"}
          variant="rose"
          loading={submit.isPending}
          disabled={!avatar}
          onPress={() => submit.mutate()}
        />
      </ScrollView>
    </Screen>
  );
}
