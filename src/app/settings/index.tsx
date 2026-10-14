// src/app/settings/index.tsx
import { userMessage } from "@/api/errors";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/auth/authStore";
import { LANGUAGES, findLanguage } from "@/config/languages";
import { showToast } from "@/lib/toast";
import { useTheme, type ThemeMode } from "@/theme";
import { Button, Card, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { spacing, colors, radius, mode, setMode } = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();

  const [showLogout, setShowLogout] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  const themeOptions: {
    key: ThemeMode;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { key: "system", label: "System", icon: "phone-portrait-outline" },
    { key: "light", label: "Light", icon: "sunny-outline" },
    { key: "dark", label: "Dark", icon: "moon-outline" },
  ];

  const currentLanguage = user?.primaryLanguage
    ? (findLanguage(user.primaryLanguage)?.name ?? user.primaryLanguage)
    : "Not set";

  const updateLanguage = useMutation({
    mutationFn: (code: string) => usersApi.updateMe({ primaryLanguage: code }),
    onSuccess: (_data, code) => {
      updateUser({ primaryLanguage: code });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      showToast("Language updated", "success");
      setShowLanguage(false);
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  const handleLogout = async () => {
    setShowLogout(false);
    await logout();
    showToast("Logged out", "success");
    router.replace("/(auth)/phone");
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.xl }}>
        <View style={{ marginBottom: spacing.xl }}>
          <Text variant="display">Settings</Text>
        </View>

        {/* Appearance */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Text
            variant="caption"
            color="textSecondary"
            style={{ marginBottom: spacing.sm }}
          >
            Appearance
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: spacing.sm,
              marginTop: spacing.sm,
            }}
          >
            {themeOptions.map((opt) => {
              const selected = mode === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => setMode(opt.key)}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    paddingVertical: spacing.md,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: selected ? colors.rose : colors.border,
                    backgroundColor: selected
                      ? colors.roseSoft
                      : colors.surface,
                  }}
                >
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={selected ? colors.rose : colors.textSecondary}
                  />
                  <Text
                    variant="small"
                    color={selected ? "rose" : "textSecondary"}
                    style={{ marginTop: 6 }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {/* Preferences */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Text
            variant="caption"
            color="textSecondary"
            style={{ marginBottom: spacing.sm }}
          >
            Preferences
          </Text>

          <MenuRow
            label="Primary language"
            value={currentLanguage}
            icon="language-outline"
            onPress={() => setShowLanguage(true)}
          />
        </Card>

        {/* Legal */}
        <Card style={{ marginBottom: spacing.lg }}>
          <Text
            variant="caption"
            color="textSecondary"
            style={{ marginBottom: spacing.sm }}
          >
            Legal
          </Text>

          <MenuRow
            label="Terms of Service"
            icon="document-text-outline"
            onPress={() => router.push("/settings/terms" as never)}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuRow
            label="Privacy Policy"
            icon="shield-checkmark-outline"
            onPress={() => router.push("/settings/privacy" as never)}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MenuRow
            label="About connectx"
            icon="information-circle-outline"
            onPress={() => router.push("/settings/about" as never)}
          />
        </Card>

        {/* Account */}
        <Card
          style={{
            marginBottom: spacing.lg,
            borderColor: colors.border,
          }}
        >
          <Text
            variant="caption"
            color="textSecondary"
            style={{ marginBottom: spacing.sm }}
          >
            Account
          </Text>

          <MenuRow
            label="Delete account"
            icon="trash-outline"
            onPress={() => router.push("/settings/delete-account" as never)}
            destructive
          />
        </Card>

        {/* Logout */}
        <Button
          label="Log out"
          variant="outline"
          onPress={() => setShowLogout(true)}
        />

        <Text
          variant="small"
          color="textMuted"
          align="center"
          style={{ marginTop: spacing.xl }}
        >
          connectx v1.0.0
        </Text>
      </ScrollView>

      {/* Language selector */}
      <Modal visible={showLanguage} transparent animationType="slide">
        <Pressable
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
          onPress={() => setShowLanguage(false)}
        >
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radius["2xl"],
                borderTopRightRadius: radius["2xl"],
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.lg,
                paddingBottom: spacing["2xl"],
                maxHeight: "75%",
              },
            ]}
            onPress={() => {}}
          >
            <View
              style={[styles.handle, { backgroundColor: colors.borderStrong }]}
            />
            <Text
              variant="h3"
              style={{ marginTop: spacing.lg, marginBottom: spacing.md }}
            >
              Primary language
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {LANGUAGES.map((lang) => {
                const selected = user?.primaryLanguage === lang.code;
                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => updateLanguage.mutate(lang.code)}
                    disabled={updateLanguage.isPending}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: spacing.md,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.divider,
                    }}
                  >
                    <Text
                      variant="body"
                      color={selected ? "rose" : "textPrimary"}
                      style={{ flex: 1, fontWeight: selected ? "700" : "400" }}
                    >
                      {lang.name}
                    </Text>
                    {selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.rose}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Logout confirmation */}
      <Modal visible={showLogout} transparent animationType="fade">
        <View
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              padding: spacing.xl,
              width: "85%",
              maxWidth: 340,
            }}
          >
            <Text variant="h3" style={{ textAlign: "center" }}>
              Log out?
            </Text>
            <Text
              variant="body"
              color="textSecondary"
              style={{ marginTop: spacing.sm, textAlign: "center" }}
            >
              You will need to sign in again to use connectx.
            </Text>

            <View
              style={{
                flexDirection: "row",
                gap: spacing.md,
                marginTop: spacing.xl,
              }}
            >
              <Pressable
                onPress={() => setShowLogout(false)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                }}
              >
                <Text variant="bodyStrong">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: radius.md,
                  backgroundColor: colors.danger,
                  alignItems: "center",
                }}
              >
                <Text variant="bodyStrong" color="textOnRose">
                  Log out
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function MenuRow({
  label,
  value,
  icon,
  onPress,
  destructive,
}: {
  label: string;
  value?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}) {
  const { colors, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
      }}
    >
      <Ionicons
        name={icon}
        size={20}
        color={destructive ? colors.danger : colors.textSecondary}
      />
      <Text
        variant="body"
        color={destructive ? "danger" : "textPrimary"}
        style={{ flex: 1, marginLeft: spacing.md }}
      >
        {label}
      </Text>
      {value ? (
        <Text
          variant="caption"
          color="textMuted"
          style={{ marginRight: spacing.sm }}
        >
          {value}
        </Text>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    alignSelf: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
  },
});
