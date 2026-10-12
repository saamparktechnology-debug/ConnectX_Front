// LOGIC PRESERVED:
//   - Male: discovery feed, Random Call, CompanionDetailSheet, useFocusEffect for /me refresh
//   - Female: greeting, verification banners, working toggleOnline, wallet snapshot
//   - Gender branch at top level
//   - useDiscovery with search/language/category
// VISUAL CHANGES:
//   - Compact top bar
//   - Cashback banner
//   - Connect & Make Friends banner
//   - Search input + language filter chips (functional)
//   - Category chips (visual, backing data coming in Batch 3)

import { callsApi } from "@/api/calls";
import { userMessage } from "@/api/errors";
import type { DiscoverableFemale } from "@/api/users";
import { useAuthStore } from "@/auth/authStore";
import { CompanionDetailSheet } from "@/components/CompanionDetailSheet";
import { LANGUAGES } from "@/config/languages";
import { useCallStore } from "@/features/calls/callStore";
import { CompanionCard } from "@/features/discovery/CompanionCard";
import { useDiscovery } from "@/features/discovery/useDiscovery";
import { useNotifications } from "@/features/notifications/useNotifications";
import { formatMoney } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Avatar, Button, Card, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

const CATEGORIES = ["All", "Star", "Relationship", "Marriage", "Confidence"];

const REASON_LABELS: Record<string, string> = {
  voice_unclear: "Voice was not clear",
  ai_voice: "Suspected AI voice",
  language_mismatch: "Language does not match profile",
  abusive_content: "Abusive or inappropriate recording",
  suspended: "Account suspended",
  other: "Other",
};

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const isFemale = user?.gender === "female";
  if (isFemale) return <FemaleHome />;
  return <MaleHome />;
}

// ═════════════════════════════════════════════════════════════════
// MALE
// ═════════════════════════════════════════════════════════════════
function MaleHome() {
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<DiscoverableFemale | null>(null);
  const startOutgoing = useCallStore((s) => s.startOutgoing);

  const { data, isLoading, isError, refetch, isRefetching } = useDiscovery(
    search,
    language,
    category.toLowerCase(),
  );

  const females = data?.females ?? [];
  const total = data?.total ?? 0;
  const { data: notifData } = useNotifications(30);
  const unreadCount =
    notifData?.notifications.filter((n) => !n.read_at).length ?? 0;

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }, [queryClient]),
  );

  const randomCall = useMutation({
    mutationFn: () => callsApi.randomCall(),
    onSuccess: (data) => {
      startOutgoing({
        sessionUuid: data.sessionUuid,
        roomId: data.roomId,
        peerNickname: "Connecting…",
        peerUuid: "random",
        peerAvatarUrl: null,
        token: data.callerToken,
      });
      router.push({
        pathname: "/call/outgoing",
        params: { sessionUuid: data.sessionUuid },
      });
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  const handleRandomCall = () => {
    if (randomCall.isPending) return;
    randomCall.mutate();
  };

  return (
    <Screen padded={false}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={{ fontSize: 26, fontWeight: "800", fontStyle: "italic" }}>
          ConnectX
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={() => router.push("/recharge/amount" as never)}
            style={[styles.balanceChip, { backgroundColor: colors.primary }]}
          >
            <View style={styles.saleBadge}>
              <Text
                style={{ color: "#E8457C", fontSize: 10, fontWeight: "800" }}
              >
                % Sale
              </Text>
            </View>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: "800",
                marginLeft: 6,
              }}
            >
              {formatMoney(user?.walletBalance ?? "0")}
            </Text>
            <View style={styles.plusCircle}>
              <Ionicons name="add" size={14} color={colors.primary} />
            </View>
          </Pressable>

          <Pressable onPress={() => router.push("/(tabs)/profile" as never)}>
            <Avatar
              uri={user?.avatarUrl}
              name={user?.nickname ?? "U"}
              size={38}
            />
          </Pressable>
          <Pressable
            onPress={() => router.push("/notifications" as never)}
            hitSlop={8}
            style={{ position: "relative" }}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.textPrimary}
            />
            {unreadCount > 0 ? (
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  paddingHorizontal: 4,
                  borderRadius: 8,
                  backgroundColor: colors.danger,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "800" }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Cashback banner */}
        <Pressable onPress={() => router.push("/recharge/amount" as never)}>
          <LinearGradient
            colors={["#3B2B5C", "#2A1D3F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cashbackBanner}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}
              >
                Avail cashbacks
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  fontWeight: "900",
                  marginTop: 2,
                }}
              >
                upto 60% on recharges!
              </Text>
            </View>
            <View style={styles.buyNowBtn}>
              <Text
                style={{ color: "#3B2B5C", fontSize: 13, fontWeight: "800" }}
              >
                Buy Now
              </Text>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Connect & Make Friends banner */}
        <View
          style={[
            styles.connectBanner,
            { backgroundColor: colors.roseSoft, borderColor: colors.primary },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "800" }}>
              Connect &amp; Make Friends
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              <Ionicons name="shuffle" size={14} color={colors.primary} />
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "800",
                  marginLeft: 4,
                }}
              >
                @ ₹3/min only!
              </Text>
            </View>
          </View>
          <Pressable
            onPress={handleRandomCall}
            style={[styles.randomBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>
              Random Call
            </Text>
          </Pressable>
        </View>

        {/* Search bar */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              placeholder="Search by name or CX ID…"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                flex: 1,
                fontSize: 14,
                color: colors.textPrimary,
                marginLeft: 8,
                paddingVertical: 0,
              }}
            />
            {search ? (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Language filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 4,
          }}
        >
          <Pressable
            onPress={() => setLanguage("")}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: language === "" ? colors.primary : colors.border,
              backgroundColor:
                language === "" ? colors.primarySoft : colors.surface,
            }}
          >
            <Text
              style={{
                color: language === "" ? colors.primary : colors.textSecondary,
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              All Languages
            </Text>
          </Pressable>

          {LANGUAGES.map((lang) => {
            const active = language === lang.code;
            return (
              <Pressable
                key={lang.code}
                onPress={() => setLanguage(active ? "" : lang.code)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primarySoft : colors.surface,
                }}
              >
                <Text
                  style={{
                    color: active ? colors.primary : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {lang.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Featured Experts heading */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "800" }}>
            Featured Experts
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            {total} online
          </Text>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 8,
            paddingHorizontal: 16,
            paddingBottom: 4,
          }}
          style={{ marginBottom: 12 }}
        >
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.catChip,
                  active
                    ? { backgroundColor: "#E8457C", borderColor: "#E8457C" }
                    : {
                        backgroundColor: colors.surface,
                        borderColor: "#E8457C",
                        borderWidth: 1.5,
                      },
                ]}
              >
                <Text
                  style={{
                    color: active ? "#FFFFFF" : colors.textPrimary,
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* List */}
        {isLoading ? (
          <View style={{ paddingTop: 40, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : isError ? (
          <View style={{ paddingHorizontal: 16 }}>
            <Card>
              <Text variant="bodyStrong" color="danger">
                Couldn't load companions
              </Text>
              <Text
                variant="caption"
                color="textSecondary"
                style={{ marginTop: 4 }}
              >
                Pull down to refresh.
              </Text>
            </Card>
          </View>
        ) : females.length === 0 ? (
          <View style={{ paddingHorizontal: 16 }}>
            <Card>
              <Text variant="bodyStrong">
                {search || language
                  ? "No companions match your filters"
                  : "No companions online"}
              </Text>
              <Text
                variant="caption"
                color="textSecondary"
                style={{ marginTop: 4 }}
              >
                {search || language
                  ? "Try a different name, ID, or language."
                  : "Check back in a little while."}
              </Text>
            </Card>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16 }}>
            {females.map((item) => (
              <CompanionCard
                key={item.uuid}
                companion={item}
                onPress={() => setSelected(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <CompanionDetailSheet
        companion={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
      />
    </Screen>
  );
}

// ═════════════════════════════════════════════════════════════════
// FEMALE
// ═════════════════════════════════════════════════════════════════
function FemaleHome() {
  const { spacing, colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }, [queryClient]),
  );

  const toggleOnline = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const next = !user?.isOnline;
      const { patch } = await import("@/api/client");
      const result = await patch<{ isOnline: boolean }>(
        "/users/status/online",
        { isOnline: next },
      );
      updateUser({ isOnline: result.isOnline });
      showToast(
        result.isOnline ? "You are now online" : "You are now offline",
        "success",
      );
    } catch (err) {
      showToast(userMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const status = user?.verificationStatus;
  const isVerified = status === "approved";
  const reason = user?.verificationRejectionReason;
  const reasonLabel = reason ? (REASON_LABELS[reason] ?? reason) : null;

  return (
    <Screen padded={false}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={{ fontSize: 26, fontWeight: "800", fontStyle: "italic" }}>
          Connecto
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={[styles.topChip, { backgroundColor: colors.primary }]}>
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "800" }}>
              Top 🏆
            </Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/profile" as never)}>
            <Avatar
              uri={user?.avatarUrl}
              name={user?.nickname ?? "U"}
              size={38}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting + verification status */}
        <View style={{ paddingHorizontal: 16, marginBottom: spacing.md }}>
          <Text variant="h2">Hi, {user?.nickname}</Text>
          <Text
            variant="caption"
            color="textSecondary"
            style={{ marginTop: 2 }}
          >
            {isVerified && "You are verified"}
            {status === "pending" && "Verification in review"}
            {status === "rejected" && "Verification rejected"}
            {status === "unverified" && "Please complete verification"}
          </Text>
        </View>

        {/* Pending banner */}
        {status === "pending" ? (
          <Pressable
            onPress={() => router.push("/verification/status" as never)}
          >
            <Card
              style={{
                borderColor: colors.warning,
                backgroundColor: colors.warningSoft,
                marginHorizontal: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="hourglass-outline"
                  size={22}
                  color={colors.warning}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="bodyStrong" color="warning">
                    Verification pending
                  </Text>
                  <Text
                    variant="caption"
                    color="textSecondary"
                    style={{ marginTop: 2 }}
                  >
                    We'll notify you once our team reviews your voice.
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ) : null}

        {/* Rejected banner */}
        {status === "rejected" ? (
          <Pressable
            onPress={() => router.push("/verification/status" as never)}
          >
            <Card
              style={{
                borderColor: colors.danger,
                backgroundColor: colors.dangerSoft,
                marginHorizontal: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color={colors.danger}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="bodyStrong" color="danger">
                    Verification rejected
                  </Text>
                  {reasonLabel ? (
                    <Text
                      variant="caption"
                      color="textSecondary"
                      style={{ marginTop: 4 }}
                    >
                      Reason: {reasonLabel}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Card>
          </Pressable>
        ) : null}

        {/* Unverified banner */}
        {status === "unverified" ? (
          <Pressable
            onPress={() => router.push("/verification/status" as never)}
          >
            <Card
              style={{
                borderColor: colors.primary,
                backgroundColor: colors.primarySoft,
                marginHorizontal: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color={colors.primary}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text variant="bodyStrong" color="primary">
                    Complete verification
                  </Text>
                  <Text
                    variant="caption"
                    color="textSecondary"
                    style={{ marginTop: 2 }}
                  >
                    Verify your voice to start receiving calls.
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ) : null}

        {/* Go Online button */}
        <View style={{ paddingHorizontal: 16, marginTop: spacing.sm }}>
          <Button
            label={user?.isOnline ? "Go offline" : "Go online"}
            variant={user?.isOnline ? "outline" : "rose"}
            loading={busy}
            disabled={!isVerified}
            onPress={toggleOnline}
          />
          {!isVerified ? (
            <Text
              variant="small"
              color="textMuted"
              align="center"
              style={{ marginTop: spacing.sm }}
            >
              Complete verification to go online.
            </Text>
          ) : null}
        </View>

        {/* Leaderboards */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginHorizontal: 16,
            marginTop: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 12 }}>
            Leaderboards
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LinearGradient
              colors={["#9F7AEA", "#D946A6"]}
              style={[styles.leaderCard, { marginRight: 12 }]}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}
              >
                100% Anonymous &amp; Secure
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: "700",
                  marginTop: 4,
                }}
              >
                No Personal Info Sharing
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: "700",
                  marginTop: 4,
                }}
              >
                Bad People → Life Ban
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: "900",
                  marginTop: 12,
                }}
              >
                Connecto Safety 🛡
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={["#3B6DF5", "#1E3BB5"]}
              style={styles.leaderCard}
            >
              <Text
                style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "800" }}
              >
                Take Calls &amp; Maximize
              </Text>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: "800",
                  marginTop: 4,
                }}
              >
                Total Talktime
              </Text>
              <View style={{ flex: 1 }} />
              <Pressable onPress={() => router.push("/(tabs)/wallet" as never)}>
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "900",
                    marginTop: 12,
                  }}
                >
                  Check Wallet
                </Text>
              </Pressable>
            </LinearGradient>
          </ScrollView>
        </View>

        {/* Wallet snapshot */}
        <Card style={{ marginTop: 16, marginHorizontal: 16 }}>
          <Text variant="caption" color="textSecondary">
            Wallet balance
          </Text>
          <Text variant="display" style={{ marginTop: 4 }}>
            {formatMoney(user?.walletBalance ?? "0")}
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  balanceChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 6,
    borderRadius: 999,
  },
  saleBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  topChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  cashbackBanner: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  buyNowBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  connectBanner: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
  },
  randomBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  catChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  leaderCard: {
    width: 200,
    height: 140,
    borderRadius: 16,
    padding: 14,
    justifyContent: "center",
  },
});
