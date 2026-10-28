// src/app/withdraw/history.tsx
import { StatusBadge } from "@/features/wallet/StatusBadge";
import { useWithdrawalHistory } from "@/features/wallet/useWithdrawalHistory";
import { formatMoney } from "@/lib/format";
import { useTheme } from "@/theme";
import { Card, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

export default function WithdrawalHistoryScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const { data, isLoading, refetch, isRefetching } = useWithdrawalHistory(
    30,
    0,
  );

  return (
    <Screen>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.lg,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h2" style={{ marginLeft: spacing.md }}>
          Withdrawal history
        </Text>
      </View>

      {isLoading ? (
        <View style={{ paddingTop: spacing["3xl"], alignItems: "center" }}>
          <ActivityIndicator color={colors.rose} />
        </View>
      ) : (
        <FlatList
          data={data?.withdrawals ?? []}
          keyExtractor={(item) => item.uuid}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: spacing.md }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text variant="bodyStrong">
                  {formatMoney(item.requestedAmount)}
                </Text>
                <StatusBadge status={item.status} />
              </View>

              <View style={{ marginTop: spacing.sm, gap: 4 }}>
                <Row label="Net payout" value={formatMoney(item.netAmount)} />
                <Row
                  label="Tax (2.5%)"
                  value={`- ${formatMoney(item.taxAmount)}`}
                />
                <Row label="UPI" value={item.payoutUpiId} />
                <Row
                  label="Requested"
                  value={new Date(item.createdAt).toLocaleString("en-IN")}
                />
                {item.processedAt ? (
                  <Row
                    label="Processed"
                    value={new Date(item.processedAt).toLocaleString("en-IN")}
                  />
                ) : null}
                {item.adminNote ? (
                  <Row label="Note" value={item.adminNote} />
                ) : null}
              </View>
            </Card>
          )}
          contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor={colors.rose}
            />
          }
          ListEmptyComponent={
            <Card>
              <Text variant="bodyStrong">No withdrawals yet</Text>
              <Text
                variant="caption"
                color="textSecondary"
                style={{ marginTop: spacing.xs }}
              >
                Withdrawal requests will show up here.
              </Text>
            </Card>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text variant="small" color="textSecondary">
        {label}
      </Text>
      <Text
        variant="small"
        numberOfLines={1}
        style={{ maxWidth: "60%", textAlign: "right" }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({});
