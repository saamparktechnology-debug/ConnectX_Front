// src/features/wallet/TransactionRow.tsx
import type { WalletTransaction } from "@/api/wallet";
import type { WithdrawalStatus } from "@/api/withdrawals";
import { useTheme } from "@/theme";
import { Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { StatusBadge } from "./StatusBadge";
import { labelForTxn, signedAmount } from "./formatTxn";

const ICONS: Record<WalletTransaction["type"], keyof typeof Ionicons.glyphMap> =
  {
    recharge: "arrow-down-circle",
    call_debit: "call",
    call_credit: "call",
    withdrawal: "arrow-up-circle",
    withdrawal_refund: "refresh-circle",
    promotion: "gift",
    admin_adjustment: "construct",
  };

type Props = {
  txn: WalletTransaction;
  withdrawalStatus?: WithdrawalStatus | null;
};

export function TransactionRow({ txn, withdrawalStatus }: Props) {
  const { colors, spacing } = useTheme();
  const isCredit = txn.direction === "credit";

  const date = new Date(txn.created_at);
  const dateStr = date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View
      style={[
        styles.row,
        {
          borderBottomColor: colors.divider,
          paddingVertical: spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: isCredit
              ? colors.successSoft
              : colors.surfaceRaised,
          },
        ]}
      >
        <Ionicons
          name={ICONS[txn.type] ?? "ellipse"}
          size={20}
          color={isCredit ? colors.success : colors.textSecondary}
        />
      </View>

      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {labelForTxn(txn)}
          </Text>
          {withdrawalStatus ? (
            <View style={{ marginLeft: spacing.sm }}>
              <StatusBadge status={withdrawalStatus} />
            </View>
          ) : null}
        </View>
        <Text variant="small" color="textMuted">
          {dateStr}
        </Text>
      </View>

      <Text variant="bodyStrong" color={isCredit ? "success" : "textPrimary"}>
        {signedAmount(txn)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
