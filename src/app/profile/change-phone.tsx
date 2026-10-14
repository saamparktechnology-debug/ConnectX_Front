// src/app/profile/change-phone.tsx
import { userMessage } from "@/api/errors";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/auth/authStore";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Input, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

type Stage = "enter-phone" | "enter-otp";

export default function ChangePhoneScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const logout = useAuthStore((s) => s.logout);

  const [stage, setStage] = useState<Stage>("enter-phone");
  const [local, setLocal] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const e164 = local ? `+91${local.replace(/\D/g, "")}` : "";
  const phoneValid = /^\+[1-9]\d{7,14}$/.test(e164);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(
      () => setResendCooldown((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(t);
  }, [resendCooldown]);

  const requestOtp = useMutation({
    mutationFn: () => usersApi.requestPhoneChange(e164),
    onSuccess: (data) => {
      setStage("enter-otp");
      setResendCooldown(30);
      if (data.debugOtp) setOtp(data.debugOtp);
      showToast("OTP sent to new number", "success");
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  const verifyOtp = useMutation({
    mutationFn: () => usersApi.verifyPhoneChange(e164, otp),
    onSuccess: async () => {
      showToast("Phone number updated. Please log in again.", "success");
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
              Change phone
            </Text>
          </View>

          {stage === "enter-phone" ? (
            <>
              <View style={{ marginBottom: spacing.xl }}>
                <Text variant="body" color="textSecondary">
                  Enter your new mobile number. We'll send a 6-digit code to
                  verify it.
                </Text>
              </View>

              <Input
                label="New mobile number"
                keyboardType="number-pad"
                autoFocus
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

              <Button
                label="Send OTP"
                variant="rose"
                loading={requestOtp.isPending}
                disabled={!phoneValid}
                onPress={() => requestOtp.mutate()}
              />
            </>
          ) : (
            <>
              <View style={{ marginBottom: spacing.xl }}>
                <Text variant="body" color="textSecondary">
                  Enter the 6-digit code we sent to {e164}.
                </Text>
              </View>

              <Input
                label="OTP"
                keyboardType="number-pad"
                autoFocus
                maxLength={6}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, ""))}
                placeholder="••••••"
              />

              <Button
                label="Verify & change"
                variant="rose"
                loading={verifyOtp.isPending}
                disabled={otp.length !== 6}
                onPress={() => verifyOtp.mutate()}
              />

              <Button
                label={
                  resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend OTP"
                }
                variant="ghost"
                disabled={resendCooldown > 0 || requestOtp.isPending}
                onPress={() => requestOtp.mutate()}
                style={{ marginTop: spacing.sm }}
              />

              <Text
                variant="small"
                color="warning"
                align="center"
                style={{ marginTop: spacing.lg }}
              >
                You'll be logged out and need to sign in again with the new
                number.
              </Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
