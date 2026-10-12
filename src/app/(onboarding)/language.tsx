// src/app/(onboarding)/language.tsx

import { post } from "@/api/client";
import { userMessage } from "@/api/errors";
import { useAuthStore } from "@/auth/authStore";
import { LANGUAGES } from "@/config/languages";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

/**
 * Step 2 of onboarding: languages.
 *
 * User picks 1+ languages. The FIRST one selected becomes the primary,
 * or they can explicitly tap "Set as primary" on any selected language.
 *
 * On submit, calls POST /users/onboarding/complete with:
 *   - realName (from user snapshot)
 *   - birthYear (passed from previous screen)
 *   - avatarUrl (passed from previous screen)
 *   - primaryLanguage (the chosen primary)
 *   - idNumber + idName (placeholders — real KYC in M6)
 */
export default function LanguageScreen() {
  const router = useRouter();
  const { spacing, colors, radius } = useTheme();
  const params = useLocalSearchParams<{
    birthYear?: string;
    avatar?: string;
  }>();

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const markOnboardingComplete = useAuthStore((s) => s.markOnboardingComplete);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [primary, setPrimary] = useState<string | null>(null);

  const birthYear = params.birthYear ?? "";
  const avatar = params.avatar ?? "";

  const toggleLanguage = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
        // If we removed the primary, clear it
        if (primary === code) setPrimary(null);
      } else {
        next.add(code);
        // If nothing selected as primary yet, auto-assign
        if (!primary) setPrimary(code);
      }
      return next;
    });
  };

  const setAsPrimary = (code: string) => {
    if (!selected.has(code)) return;
    setPrimary(code);
  };

  const canContinue = useMemo(
    () => selected.size >= 1 && !!primary,
    [selected, primary],
  );

  const submit = useMutation({
    mutationFn: async () => {
      const payload = {
        realName: user?.nickname ?? "",
        idNumber: "",
        idName: "",
        birthYear: birthYear || String(new Date().getFullYear() - 25),
        primaryLanguage: primary!,
        avatarUrl: avatar || null,
      };

      console.log("════════ [language] SUBMITTING ONBOARDING ════════");
      console.log("[language] payload:", JSON.stringify(payload, null, 2));

      const resp = await post<{ status: string }>(
        "/users/onboarding/complete",
        payload,
      );

      console.log("[language] ✅ server response:", resp);
      return resp;
    },
    onSuccess: () => {
      if (avatar) {
        updateUser({ avatarUrl: avatar });
      }
      markOnboardingComplete();

      const status = user?.verificationStatus;

      // Female goes to voice step ONLY if she hasn't verified yet.
      // If already pending/approved/rejected, skip voice.
      const needsVoice =
        user?.gender === "female" &&
        (status === "unverified" || status === "rejected");

      if (needsVoice) {
        router.replace({
          pathname: "/(onboarding)/voice",
          params: { primaryLanguage: primary ?? "hi" },
        });
      } else {
        router.replace("/(tabs)/home");
      }
    },
    onError: (err) => {
      console.log("[language] ❌ mutation error:", err);
      showToast(userMessage(err), "error");
    },
  });

  if (!user) return null;

  return (
    <Screen>
      <View style={{ flex: 1, paddingVertical: spacing.xl }}>
        <View style={{ marginBottom: spacing.lg }}>
          <Text variant="display">Languages</Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginTop: spacing.sm }}
          >
            Pick the languages you speak. Then choose one as your primary.
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = selected.has(lang.code);
            const isPrimary = primary === lang.code;

            return (
              <Pressable
                key={lang.code}
                onPress={() => toggleLanguage(lang.code)}
                style={[
                  styles.row,
                  {
                    borderColor: isSelected ? colors.rose : colors.border,
                    backgroundColor: isSelected
                      ? colors.roseSoft
                      : colors.surface,
                    borderRadius: radius.md,
                    marginBottom: spacing.sm,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                  },
                ]}
              >
                {/* Checkbox */}
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: isSelected
                        ? colors.rose
                        : colors.borderStrong,
                      backgroundColor: isSelected ? colors.rose : "transparent",
                    },
                  ]}
                >
                  {isSelected ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : null}
                </View>

                {/* Label */}
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text
                    variant="bodyStrong"
                    color={isSelected ? "rose" : "textPrimary"}
                  >
                    {lang.name}
                  </Text>
                  {isPrimary ? (
                    <Text variant="small" color="rose">
                      Primary
                    </Text>
                  ) : null}
                </View>

                {/* Set-as-primary button — only shown for selected non-primary */}
                {isSelected && !isPrimary ? (
                  <Pressable
                    onPress={() => setAsPrimary(lang.code)}
                    hitSlop={8}
                    style={{
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: radius.sm,
                    }}
                  >
                    <Text variant="small" color="textSecondary">
                      Set primary
                    </Text>
                  </Pressable>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Submit */}
        <View
          style={{
            marginTop: spacing.md,
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text
            variant="small"
            color="textMuted"
            style={{ marginBottom: spacing.sm }}
          >
            {selected.size === 0
              ? "Select at least one language"
              : primary
                ? `Primary: ${LANGUAGES.find((l) => l.code === primary)?.name}`
                : "Choose a primary language"}
          </Text>

          <Button
            label="Finish setup"
            variant="rose"
            loading={submit.isPending}
            disabled={!canContinue}
            onPress={() => submit.mutate()}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
