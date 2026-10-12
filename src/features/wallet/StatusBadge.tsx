// src/features/wallet/StatusBadge.tsx
import type { WithdrawalStatus } from "@/api/withdrawals";
import { useTheme } from "@/theme";
import { Text } from "@/ui";
import { View } from "react-native";

const LABELS: Record<WithdrawalStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  rejected: "Rejected",
  failed: "Failed",
};

const COLORS: Record<
  WithdrawalStatus,
  "warning" | "success" | "danger" | "textMuted"
> = {
  pending: "warning",
  paid: "success",
  rejected: "danger",
  failed: "danger",
};

const BG_COLORS: Record<
  WithdrawalStatus,
  "warningSoft" | "successSoft" | "dangerSoft" | "surfaceRaised"
> = {
  pending: "warningSoft",
  paid: "successSoft",
  rejected: "dangerSoft",
  failed: "dangerSoft",
};

export function StatusBadge({ status }: { status: WithdrawalStatus }) {
  const { colors, radius, spacing } = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.full,
        backgroundColor: colors[BG_COLORS[status]],
      }}
    >
      <Text variant="small" color={COLORS[status]}>
        {LABELS[status]}
      </Text>
    </View>
  );
}
