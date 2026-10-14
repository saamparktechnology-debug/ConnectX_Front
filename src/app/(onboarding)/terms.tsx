// src/app/(onboarding)/terms.tsx
import { configApi } from "@/api/config";
import { userMessage } from "@/api/errors";
import { useAuthStore } from "@/auth/authStore";
import { useAppConfig } from "@/features/onboarding/useAppConfig";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

export default function TermsScreen() {
  const router = useRouter();
  const { spacing, colors, radius } = useTheme();
  const { data } = useAppConfig();
  const [checked, setChecked] = useState(false);

  const accept = useMutation({
    mutationFn: () => configApi.acceptTerms(),
    onSuccess: () => {
      useAuthStore.setState((s) => ({
        user: s.user
          ? { ...s.user, termsAcceptedAt: new Date().toISOString() }
          : null,
      }));
      router.replace("/(onboarding)/channels" as never);
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.xl }}>
        <Text variant="h2">Terms & Conditions</Text>
        <Text variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
          Please read before continuing
        </Text>

        <View
          style={{
            marginTop: spacing.xl,
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ lineHeight: 22, fontSize: 14 }}>
            {data?.terms_female ?? "Loading..."}
          </Text>
        </View>

        <Pressable
          onPress={() => setChecked(!checked)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: spacing.xl,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 1.5,
              borderColor: checked ? colors.primary : colors.borderStrong,
              backgroundColor: checked ? colors.primary : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {checked ? (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            ) : null}
          </View>
          <Text style={{ marginLeft: 12, fontSize: 14, fontWeight: "600" }}>
            I have read and agree to the Terms & Conditions
          </Text>
        </Pressable>

        <View style={{ marginTop: spacing["2xl"] }}>
          <Button
            label="Continue"
            variant="rose"
            disabled={!checked}
            loading={accept.isPending}
            onPress={() => accept.mutate()}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
