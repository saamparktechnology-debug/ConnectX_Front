import { authApi, type VerifyOtpResponse } from "@/api/auth";
import { userMessage } from "@/api/errors";
import { useAuthStore } from "@/auth/authStore";
import { StoredUser } from "@/auth/secureStore";
import { getOrCreateDeviceId } from "@/lib/device";
import { maskPhone } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Input, Screen, Text } from "@/ui";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

export default function OtpScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const params = useLocalSearchParams<{ phone: string; debugOtp?: string }>();
  const phone = params.phone ?? "";
  const debugOtp = params.debugOtp ?? "";

  const setSession = useAuthStore((s) => s.setSession);
  const [code, setCode] = useState(debugOtp);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(
      () => setResendCooldown((s) => Math.max(0, s - 1)),
      1000,
    );
    return () => clearInterval(t);
  }, [resendCooldown]);

  const verify = useMutation({
    mutationFn: () => authApi.verifyOtp({ phone, otp: code, deviceId }),
    onSuccess: async (data: VerifyOtpResponse) => {
      if (data.onboardingRequired) {
        router.replace({
          pathname: "/(auth)/gender",
          params: {
            phone,
            deviceId,
            onboardingToken: data.onboardingToken,
          },
        });
        return;
      }

      const stored: StoredUser = {
        id: data.user.id,
        uuid: data.user.uuid,
        publicId: data.user.publicId,
        phone: data.user.phone,
        gender: data.user.gender,
        nickname: data.user.nickname,
        avatarUrl: data.user.avatarUrl,
        verificationStatus: data.user.verificationStatus,
        walletBalance: data.user.walletBalance,
        isOnline: data.user.isOnline,
        onboardingCompleted: data.user.onboardingCompleted,
        primaryLanguage: data.user.primaryLanguage,
        termsAcceptedAt: data.user.termsAcceptedAt,
        channelsAcknowledgedAt: data.user.channelsAcknowledgedAt,
      };

      await setSession({
        user: stored,
        accessToken: data.accessToken!,
        refreshToken: data.refreshToken!,
      });

      router.replace("/(tabs)/home");
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  const resend = useMutation({
    mutationFn: () => authApi.sendOtp(phone),
    onSuccess: () => {
      setResendCooldown(30);
      showToast("OTP resent", "success");
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center" }}
      >
        <View style={{ marginBottom: spacing["3xl"] }}>
          <Text variant="display">Verify number</Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginTop: spacing.sm }}
          >
            We sent a 6-digit code to {maskPhone(phone)}
          </Text>
        </View>

        <Input
          label="OTP"
          keyboardType="number-pad"
          autoFocus
          maxLength={6}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, ""))}
          placeholder="••••••"
        />

        {debugOtp ? (
          <Text
            variant="small"
            color="warning"
            style={{ marginTop: -spacing.sm, marginBottom: spacing.md }}
          >
            Dev OTP: {debugOtp}
          </Text>
        ) : null}

        <Button
          label="Verify"
          variant="rose"
          loading={verify.isPending}
          disabled={code.length !== 6 || !deviceId}
          onPress={() => verify.mutate()}
        />

        <Button
          label={
            resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"
          }
          variant="ghost"
          disabled={resendCooldown > 0 || resend.isPending}
          onPress={() => resend.mutate()}
          style={{ marginTop: spacing.sm }}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
