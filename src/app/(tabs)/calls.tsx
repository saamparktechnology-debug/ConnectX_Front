import type {
  CallHistoryDirection,
  CallHistoryRow as CallHistoryRowType,
} from "@/api/calls";
import { useAuthStore } from "@/auth/authStore";
import { CallHistoryRow } from "@/features/calls/CallHistoryRow";
import { useCallHistory } from "@/features/calls/useCallHistory";
import { useTheme } from "@/theme";
import { Card, Input, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from "react-native";

type Filter = CallHistoryDirection;

const FILTERS: {
  key: Filter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "all", label: "All", icon: "list-outline" },
  { key: "outgoing", label: "Outgoing", icon: "arrow-up-circle-outline" },
  { key: "incoming", label: "Incoming", icon: "arrow-down-circle-outline" },
  { key: "missed", label: "Missed", icon: "close-circle-outline" },
  { key: "starred", label: "Starred", icon: "star-outline" },
];

export default function CallsScreen() {
  const { spacing, colors, radius } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isFemale = user?.gender === "female";

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CallHistoryRowType | null>(null);

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCallHistory(filter, search);

  const calls = data?.pages.flatMap((p) => p.calls) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  const sections = useMemo(() => {
    const map = new Map<string, CallHistoryRowType[]>();
    for (const c of calls) {
      const d = new Date(c.startTime);
      const key = d.toLocaleDateString("en-IN", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
  }, [calls]);

  const emptyCopy = (() => {
    if (search) return "No matching calls";
    if (filter === "all") return "No calls yet";
    if (filter === "missed") return "No missed calls";
    if (filter === "starred") return "No starred calls";
    return `No ${filter} calls`;
  })();

  const onEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <Screen>
      <View style={{ paddingTop: spacing.lg }}>
        <Text variant="h1">History</Text>
        <Text variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
          {isFemale ? "Calls you received" : "Your call history"}
          {total > 0 ? ` · ${total} total` : ""}
        </Text>

        <View style={{ marginTop: spacing.md }}>
          <Input
            placeholder="Search by name…"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            leftSlot={
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.textMuted}
              />
            }
            rightSlot={
              search ? (
                <Pressable onPress={() => setSearch("")} hitSlop={8}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              ) : undefined
            }
          />
        </View>
      </View>

      {/* Filter chips — fixed-height wrapper so they don't get squeezed */}
      <View style={{ height: 44, marginVertical: spacing.sm }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: spacing.sm,
            paddingHorizontal: 0,
            alignItems: "center",
          }}
          style={{ flexGrow: 0 }}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  height: 36,
                  paddingHorizontal: spacing.md,
                  borderRadius: radius.full,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primary : colors.surface,
                }}
              >
                <Ionicons
                  name={f.icon}
                  size={14}
                  color={active ? "#FFFFFF" : colors.textSecondary}
                />
                <Text
                  variant="caption"
                  color={active ? "textOnPrimary" : "textSecondary"}
                  style={{ marginLeft: 4 }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={{ paddingTop: spacing["3xl"], alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : sections.length === 0 ? (
        <Card>
          <Text variant="bodyStrong">{emptyCopy}</Text>
          <Text
            variant="caption"
            color="textSecondary"
            style={{ marginTop: spacing.xs }}
          >
            {filter === "starred"
              ? "Calls you rate 4 or 5 stars show up here."
              : isFemale
                ? "When someone calls you, it will show up here."
                : "Place your first call from the Discover tab."}
          </Text>
        </Card>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.uuid}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor={colors.primary}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.textSecondary,
                paddingTop: 16,
                paddingBottom: 8,
              }}
            >
              {title}
            </Text>
          )}
          renderItem={({ item }) => (
            <CallHistoryRow
              call={item}
              onPress={() => setSelected(item)}
              showNotify={isFemale && item.direction === "incoming"}
            />
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View
                style={{ paddingVertical: spacing.lg, alignItems: "center" }}
              >
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : undefined
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={() => setSelected(null)}
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
              },
            ]}
            onPress={() => {}}
          >
            <View
              style={[styles.handle, { backgroundColor: colors.borderStrong }]}
            />

            {selected ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text
                  variant="h3"
                  style={{ marginTop: spacing.lg, marginBottom: spacing.md }}
                >
                  Call details
                </Text>

                <DetailRow label="With" value={selected.peerNickname} />
                <DetailRow
                  label="Direction"
                  value={
                    selected.direction === "outgoing" ? "Outgoing" : "Incoming"
                  }
                />
                <DetailRow
                  label="Date"
                  value={new Date(selected.startTime).toLocaleString("en-IN")}
                />
                <DetailRow
                  label="Duration"
                  value={`${Math.floor(selected.durationSeconds / 60)}m ${
                    selected.durationSeconds % 60
                  }s`}
                />
                <DetailRow
                  label="Billed minutes"
                  value={String(selected.billedMinutes)}
                />
                <DetailRow
                  label={
                    selected.direction === "outgoing" ? "Charged" : "Earned"
                  }
                  value={`₹${selected.amount}`}
                  bold
                />
                <DetailRow label="Status" value={selected.status} />
                {selected.myRating ? (
                  <DetailRow
                    label="Your rating"
                    value={`${selected.myRating}/5`}
                  />
                ) : null}

                <Pressable
                  onPress={() => setSelected(null)}
                  style={{
                    marginTop: spacing.lg,
                    paddingVertical: spacing.md,
                    alignItems: "center",
                  }}
                >
                  <Text variant="body" color="textMuted">
                    Close
                  </Text>
                </Pressable>
              </ScrollView>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function DetailRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
      }}
    >
      <Text variant="body" color="textSecondary">
        {label}
      </Text>
      <Text variant={bold ? "bodyStrong" : "body"}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end" },
  sheet: { maxHeight: "80%", minHeight: 200 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center" },
});
