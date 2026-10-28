import { patch } from "@/api/client";
import { userMessage } from "@/api/errors";
import { useAuthStore } from "@/auth/authStore";
import { LANGUAGES } from "@/config/languages";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function LanguageScreen() {
  const router = useRouter();
  const { spacing, colors, radius } = useTheme();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [primary, setPrimary] = useState<string | null>(null);

  const toggleLanguage = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
        if (primary === code) setPrimary(null);
      } else {
        next.add(code);
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
    mutationFn: () =>
      patch<{ primaryLanguage?: string }>("/users/me", {
        primaryLanguage: primary!,
      }),
    onSuccess: () => {
      updateUser({ primaryLanguage: primary! });
      router.replace({
        pathname: "/(onboarding)/voice",
        params: { primaryLanguage: primary! },
      });
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  if (!user) return null;
  if (user.gender === "male") {
    router.replace("/(tabs)/home");
    return null;
  }

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
            label="Continue"
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
