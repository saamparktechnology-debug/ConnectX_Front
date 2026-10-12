// src/app/(auth)/phone.tsx

import { authApi } from "@/api/auth";
import { userMessage } from "@/api/errors";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Card, Input, Screen, Text } from "@/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

/**
 * Collects phone + gender + nickname in one screen.
 *
 * Backend requires gender + nickname for new users at OTP verify time,
 * so we gather them up front. Existing users ignore these two fields.
 */
export default function PhoneScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();

  const [local, setLocal] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [nickname, setNickname] = useState("");

  const e164 = useMemo(() => {
    const digits = local.replace(/\D/g, "");
    if (!digits) return "";
    return `+91${digits}`;
  }, [local]);

  const phoneValid = /^\+[1-9]\d{7,14}$/.test(e164);
  const nicknameValid =
    nickname.trim().length >= 2 && nickname.trim().length <= 64;
  const canContinue = phoneValid && !!gender && nicknameValid;

  const mutation = useMutation({
    mutationFn: () => authApi.sendOtp(e164),
    onSuccess: (data) => {
      console.log("[phone.tsx] pushing to OTP with params:", {
        phone: e164,
        gender,
        nickname: nickname.trim(),
        debugOtp: data.debugOtp,
      });
      router.push({
        pathname: "/(auth)/otp",
        params: {
          phone: e164,
          debugOtp: data.debugOtp ?? "",
          gender: gender!,
          nickname: nickname.trim(),
        },
      });
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
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: spacing["3xl"] }}>
            <Text variant="display">Welcome</Text>
            <Text
              variant="body"
              color="textSecondary"
              style={{ marginTop: spacing.sm }}
            >
              Tell us a bit about you to get started.
            </Text>
          </View>

          {/* Phone */}
          <Input
            label="Mobile number"
            keyboardType="number-pad"
            maxLength={10}
            value={local}
            onChangeText={(t) => setLocal(t.replace(/\D/g, ""))}
            placeholder="98765 43210"
            leftSlot={
              <Text variant="bodyStrong" color="textSecondary">
                +91
              </Text>
            }
          />

          {/* Gender */}
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
                <Text
                  variant="h3"
                  color={gender === g ? "rose" : "textPrimary"}
                >
                  {g === "male" ? "Male" : "Female"}
                </Text>
              </Card>
            ))}
          </View>

          {/* Nickname */}
          <Input
            label="Nickname"
            value={nickname}
            onChangeText={setNickname}
            maxLength={64}
            placeholder="How should people see you?"
            hint="2–64 characters. You can change this later."
          />

          <Button
            label="Send OTP"
            variant="rose"
            loading={mutation.isPending}
            disabled={!canContinue}
            onPress={() => mutation.mutate()}
          />

          <Text
            variant="small"
            color="textMuted"
            align="center"
            style={{ marginTop: spacing.lg }}
          >
            By continuing you agree to our Terms and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
