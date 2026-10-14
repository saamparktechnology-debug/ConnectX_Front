import { authApi } from "@/api/auth";
import { userMessage } from "@/api/errors";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Input, Screen, Text } from "@/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

export default function PhoneScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const [local, setLocal] = useState("");

  const e164 = useMemo(() => {
    const digits = local.replace(/\D/g, "");
    if (!digits) return "";
    return `+91${digits}`;
  }, [local]);

  const isValid = /^\+[1-9]\d{7,14}$/.test(e164);

  const mutation = useMutation({
    mutationFn: () => authApi.sendOtp(e164),
    onSuccess: (data) => {
      router.push({
        pathname: "/(auth)/otp",
        params: { phone: e164, debugOtp: data.debugOtp ?? "" },
      });
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
          <Text variant="display">Welcome</Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginTop: spacing.sm }}
          >
            Enter your mobile number to continue.
          </Text>
        </View>

        <Input
          label="Mobile number"
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
          loading={mutation.isPending}
          disabled={!isValid}
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
      </KeyboardAvoidingView>
    </Screen>
  );
}
