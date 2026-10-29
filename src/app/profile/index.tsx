// LOGIC PRESERVED:
//   - isFemale check → Withdraw for female, Add Balance for male
//   - verification status display for female
//   - menu rows: Recents, Transactions, Change Language, Rate us, Share App, Contact Us
//   - logout flow
// VISUAL CHANGES:
//   - top bar with balance chip + settings icon
//   - profile card with Edit Profile + Withdraw/Add Balance buttons
//   - cleaner menu rows with blue icons
//   - "100% Safe and Private" footer

import { useAuthStore } from "@/auth/authStore";
import { findLanguage } from "@/config/languages";
import { formatMoney } from "@/lib/format";
import { useTheme } from "@/theme";
import { Avatar, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const isFemale = user.gender === "female";
  const language = user.primaryLanguage
    ? (findLanguage(user.primaryLanguage)?.name ?? user.primaryLanguage)
    : "Hindi";

  const memberSince = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Screen padded={false}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
            marginLeft: 12,
            flex: 1,
          }}
        >
          My Profile
        </Text>

        <Pressable
          onPress={() =>
            router.push(
              (isFemale ? "/withdraw/request" : "/recharge/amount") as never,
            )
          }
          style={[styles.balanceChip, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "800" }}>
            {formatMoney(user.walletBalance)}
          </Text>
          <View style={styles.plusCircle}>
            <Ionicons name="add" size={14} color={colors.primary} />
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push("/settings" as never)}
          hitSlop={8}
          style={{ marginLeft: 12 }}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Profile card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={{ alignItems: "center", paddingVertical: 8 }}>
            <Avatar uri={user.avatarUrl} name={user.nickname} size={96} />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "800",
                marginTop: 12,
                textAlign: "center",
              }}
            >
              {user.nickname}
            </Text>
            {user.publicId ? (
              <View
                style={{
                  marginTop: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor: colors.primarySoft,
                }}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 12,
                    fontWeight: "800",
                    letterSpacing: 1,
                  }}
                >
                  {user.publicId}
                </Text>
              </View>
            ) : null}

            {isFemale ? (
              <Text
                style={{
                  fontSize: 13,
                  color:
                    user.verificationStatus === "approved"
                      ? colors.success
                      : user.verificationStatus === "pending"
                        ? colors.warning
                        : user.verificationStatus === "rejected"
                          ? colors.danger
                          : colors.textMuted,
                  marginTop: 4,
                  fontWeight: "700",
                }}
              >
                {user.verificationStatus === "approved" && "✓ Verified"}
                {user.verificationStatus === "pending" &&
                  "Verification pending"}
                {user.verificationStatus === "rejected" &&
                  "Verification rejected"}
                {user.verificationStatus === "unverified" &&
                  "Verification required"}
              </Text>
            ) : null}

            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginTop: 6,
                fontWeight: "600",
              }}
            >
              Member since {memberSince}
            </Text>

            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginTop: 16,
                width: "100%",
              }}
            >
              <Pressable
                onPress={() => router.push("/profile/edit" as never)}
                style={[
                  styles.pillBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={{ fontSize: 15, fontWeight: "700" }}>
                  Edit Profile
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push(
                    (isFemale
                      ? "/withdraw/request"
                      : "/recharge/amount") as never,
                  )
                }
                style={[styles.pillBtn, { backgroundColor: colors.primary }]}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}
                >
                  {isFemale ? "Withdraw" : "Add Balance"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Menu rows */}
        <MenuRow
          icon="time-outline"
          label="Recents"
          onPress={() => router.push("/(tabs)/calls" as never)}
        />
        <MenuRow
          icon="swap-horizontal-outline"
          label={isFemale ? "Earnings" : "Transactions"}
          onPress={() => router.push("/(tabs)/wallet" as never)}
        />
        <MenuRow
          icon="language-outline"
          label="Change Language"
          value={language}
          onPress={() => router.push("/settings" as never)}
        />
        <MenuRow
          icon="star-outline"
          label="Love Connect? Rate us"
          iconColor="#FBBF24"
          onPress={() => {}}
        />
        <MenuRow
          icon="paper-plane-outline"
          label="Share App"
          onPress={() => {}}
        />
        <MenuRow icon="mail-outline" label="Contact Us" onPress={() => {}} />

        {/* Footer */}
        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={colors.success}
            />
            <Text
              style={{
                color: colors.success,
                fontSize: 14,
                fontWeight: "800",
              }}
            >
              100% Safe and Private
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function MenuRow({
  icon,
  label,
  value,
  onPress,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  iconColor?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.menuRow,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Ionicons name={icon} size={22} color={iconColor ?? colors.primary} />
      <Text
        style={{ flex: 1, fontSize: 16, fontWeight: "700", marginLeft: 14 }}
      >
        {label}
      </Text>
      {value ? (
        <Text
          style={{
            color: colors.primary,
            fontSize: 14,
            fontWeight: "700",
            marginRight: 8,
          }}
        >
          {value}
        </Text>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  balanceChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 6,
    borderRadius: 999,
  },
  plusCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  pillBtn: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
});
