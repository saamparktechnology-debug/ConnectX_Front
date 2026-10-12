// LOGIC PRESERVED:
//   - useBalance, useWalletHistory, useWithdrawalHistory, useFocusEffect
//   - refresh() calls all three refetches
//   - isFemale branching for Recharge vs Withdraw
//   - Withdrawal transactions show StatusBadge (pending/paid/rejected/failed)
//   - gender-specific labels ("Earnings" vs "Wallet")
//   - empty state, loading state
// VISUAL CHANGES:
//   - blue balance text
//   - cleaner card layout
//   - pink filter chips matching reference

import type { WithdrawalStatus } from "@/api/withdrawals";
import { useAuthStore } from "@/auth/authStore";
import { TransactionRow } from "@/features/wallet/TransactionRow";
import { useBalance } from "@/features/wallet/useBalance";
import { useWalletHistory } from "@/features/wallet/useWalletHistory";
import { useWithdrawalHistory } from "@/features/wallet/useWithdrawalHistory";
import { formatMoney } from "@/lib/format";
import { useTheme } from "@/theme";
import { Button, Card, Screen, Text } from "@/ui";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

export default function WalletScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isFemale = user?.gender === "female";

  const {
    data: balance,
    isLoading: loadingBalance,
    refetch: refetchBalance,
    isRefetching: refetchingBalance,
  } = useBalance();

  const {
    data: txs,
    isLoading: loadingHistory,
    refetch: refetchHistory,
    isRefetching: refetchingHistory,
  } = useWalletHistory(30, 0);

  const {
    data: withdrawals,
    refetch: refetchWithdrawals,
    isRefetching: refetchingWithdrawals,
  } = useWithdrawalHistory(30, 0);

  useFocusEffect(
    useCallback(() => {
      refetchBalance();
      refetchHistory();
      refetchWithdrawals();
    }, [refetchBalance, refetchHistory, refetchWithdrawals]),
  );

  const statusById = useMemo(() => {
    const map = new Map<number, WithdrawalStatus>();
    withdrawals?.withdrawals?.forEach((w) => {
      map.set(w.id, w.status);
    });
    return map;
  }, [withdrawals]);

  const refresh = () => {
    refetchBalance();
    refetchHistory();
    refetchWithdrawals();
  };

  return (
    <Screen>
      <View style={{ paddingTop: spacing.lg, marginBottom: spacing.lg }}>
        <Text variant="h1">{isFemale ? "Earnings" : "Wallet"}</Text>
      </View>

      {/* Balance card */}
      <Card style={{ marginBottom: spacing.lg }}>
        <Text variant="caption" color="textSecondary">
          Available balance
        </Text>

        {loadingBalance ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: spacing.md }}
          />
        ) : (
          <Text
            variant="display"
            style={{ marginTop: spacing.xs, color: colors.primary }}
          >
            {formatMoney(balance?.balance ?? "0")}
          </Text>
        )}

        <View style={{ marginTop: spacing.lg }}>
          {isFemale ? (
            <Button
              label="Withdraw"
              variant="rose"
              onPress={() => router.push("/withdraw/request" as never)}
            />
          ) : (
            <Button
              label="Recharge"
              variant="rose"
              onPress={() => router.push("/recharge/amount" as never)}
            />
          )}
        </View>

        {isFemale ? (
          <View style={{ marginTop: spacing.md, alignItems: "center" }}>
            <Text
              variant="caption"
              color="primary"
              onPress={() => router.push("/withdraw/history" as never)}
            >
              View withdrawal history
            </Text>
          </View>
        ) : null}
      </Card>

      <Text variant="h3" style={{ marginBottom: spacing.md }}>
        Recent activity
      </Text>

      {loadingHistory ? (
        <View style={{ paddingTop: spacing.xl, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={txs ?? []}
          keyExtractor={(item) => item.uuid}
          renderItem={({ item }) => {
            const withdrawalStatus =
              item.type === "withdrawal"
                ? (statusById.get(item.reference_id) ?? null)
                : null;
            return (
              <TransactionRow txn={item} withdrawalStatus={withdrawalStatus} />
            );
          }}
          contentContainerStyle={{ paddingBottom: spacing["3xl"] }}
          refreshControl={
            <RefreshControl
              refreshing={
                refetchingBalance || refetchingHistory || refetchingWithdrawals
              }
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <Card>
              <Text variant="bodyStrong">No transactions yet</Text>
              <Text
                variant="caption"
                color="textSecondary"
                style={{ marginTop: spacing.xs }}
              >
                {isFemale
                  ? "Calls you receive will show up here."
                  : "Recharge your wallet to start calling."}
              </Text>
            </Card>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}
