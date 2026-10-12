// LOGIC PRESERVED:
//   - Search filters companions by nickname
//   - CompanionDetailSheet opens on tap
//   - pull-to-refresh
//   - loading + error + empty states
// VISUAL CHANGES: uses same Connecto card style through CompanionCard

import type { DiscoverableFemale } from "@/api/users";
import { CompanionDetailSheet } from "@/components/CompanionDetailSheet";
import { CompanionCard } from "@/features/discovery/CompanionCard";
import { useDiscovery } from "@/features/discovery/useDiscovery";
import { useTheme } from "@/theme";
import { Card, Input, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

export default function SearchScreen() {
  const { spacing, colors } = useTheme();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DiscoverableFemale | null>(null);

  // useDiscovery now returns { females, total, limit, offset }
  const { data, isLoading, isError, refetch, isRefetching } = useDiscovery(
    query,
    "",
    "all",
  );

  // Client-side filter as an extra layer for instant response
  const filtered = useMemo(() => {
    const list = data?.females ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.nickname.toLowerCase().includes(q) ||
        (c.public_id ?? "").toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <Screen>
      <View style={{ paddingVertical: spacing.lg }}>
        <Text variant="h2">Discover</Text>
        <Text
          variant="caption"
          color="textSecondary"
          style={{ marginTop: spacing.xs, marginBottom: spacing.md }}
        >
          Find companions online right now
        </Text>

        <Input
          placeholder="Search by name or CX ID…"
          value={query}
          onChangeText={setQuery}
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
            query ? (
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
                onPress={() => setQuery("")}
              />
            ) : undefined
          }
        />
      </View>

      {isLoading ? (
        <View style={{ paddingTop: spacing["3xl"], alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : isError ? (
        <Card>
          <Text variant="bodyStrong" color="danger">
            Couldn't load
          </Text>
          <Text
            variant="caption"
            color="textSecondary"
            style={{ marginTop: spacing.xs }}
          >
            Pull down to refresh.
          </Text>
        </Card>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.uuid}
          renderItem={({ item }) => (
            <CompanionCard companion={item} onPress={() => setSelected(item)} />
          )}
          contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <Card style={{ marginTop: spacing.lg }}>
              <Text variant="bodyStrong">
                {query ? "No matches" : "No companions online"}
              </Text>
            </Card>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <CompanionDetailSheet
        companion={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
      />
    </Screen>
  );
}
