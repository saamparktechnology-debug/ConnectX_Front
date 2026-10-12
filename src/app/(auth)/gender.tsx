// src/app/(auth)/gender.tsx
import { userMessage } from "@/api/errors";
import { useAuthStore } from "@/auth/authStore";
import { StoredUser } from "@/auth/secureStore";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Card, Input, Screen, Text } from "@/ui";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

/**
 * New-user step: pick gender + nickname.
 * For M1, we hydrate the session with the params captured from the OTP screen
 * and route to tabs. Full profile persistence lands in M6.
 */
export default function GenderScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const params = useLocalSearchParams<{
    phone: string;
    deviceId: string;
    accessToken: string;
    refreshToken: string;
  }>();

  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [nickname, setNickname] = useState("");
  const setSession = useAuthStore((s) => s.setSession);

  const nicknameValid =
    nickname.trim().length >= 2 && nickname.trim().length <= 64;

  const submit = useMutation({
    mutationFn: async () => {
      const stored: StoredUser = {
        id: 0,
        uuid: "",
        phone: params.phone ?? "",
        gender: gender!,
        nickname: nickname.trim(),
        verificationStatus: "unverified",
        walletBalance: "0.00",
        isOnline: false,
      };
      return {
        user: stored,
        accessToken: params.accessToken ?? "",
        refreshToken: params.refreshToken ?? "",
      };
    },
    onSuccess: async (data) => {
      await setSession(data);
      router.replace("/(tabs)/home");
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text variant="display">Tell us about you</Text>
        <Text
          variant="body"
          color="textSecondary"
          style={{ marginTop: spacing.sm, marginBottom: spacing["3xl"] }}
        >
          This is how you'll appear on connectx24.
        </Text>

        <Text
          variant="caption"
          color="textSecondary"
          style={{ marginBottom: spacing.sm }}
        >
          I am
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: spacing.md,
            marginBottom: spacing.lg,
          }}
        >
          {(["male", "female"] as const).map((g) => (
            <Card
              key={g}
              interactive
              onPress={() => setGender(g)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: spacing.xl,
                borderColor: gender === g ? colors.rose : colors.border,
                borderWidth: gender === g ? 2 : 1,
              }}
            >
              <Text variant="h3" color={gender === g ? "rose" : "textPrimary"}>
                {g === "male" ? "Male" : "Female"}
              </Text>
            </Card>
          ))}
        </View>

        <Input
          label="Nickname"
          value={nickname}
          onChangeText={setNickname}
          maxLength={64}
          placeholder="How should people see you?"
          hint="2–64 characters. You can change this later."
        />

        <Button
          label="Continue"
          variant="rose"
          loading={submit.isPending}
          disabled={!gender || !nicknameValid}
          onPress={() => submit.mutate()}
        />
      </View>
    </Screen>
  );
}
