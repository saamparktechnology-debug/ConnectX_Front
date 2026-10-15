import type { FemaleTarget } from "@/api/targets";
import { formatMoney } from "@/lib/format";
import { useTheme } from "@/theme";
import { Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

type Props = {
  target: NonNullable<FemaleTarget>;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function TargetCard({ target }: Props) {
  const { colors, spacing } = useTheme();

  const monthLabel = `${MONTHS[target.periodMonth - 1]} ${target.periodYear}`;
  const isDone = target.isComplete;
  const percent = target.progressPercent;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: isDone ? colors.success : colors.border,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.sm,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="trophy" size={18} color={colors.warning} />
          <Text
            style={{
              fontSize: 15,
              fontWeight: "800",
              marginLeft: 8,
              color: colors.textPrimary,
            }}
          >
            Monthly Target · {monthLabel}
          </Text>
        </View>
        {isDone ? (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: colors.successSoft,
            }}
          >
            <Text
              style={{ color: colors.success, fontSize: 10, fontWeight: "800" }}
            >
              COMPLETE
            </Text>
          </View>
        ) : null}
      </View>

      {/* Numbers */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          marginBottom: spacing.sm,
        }}
      >
        <Text
          style={{ fontSize: 28, fontWeight: "900", color: colors.primary }}
        >
          {target.achievedMinutes}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: colors.textMuted,
            marginLeft: 4,
          }}
        >
          / {target.targetMinutes} min
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.surfaceRaised,
          overflow: "hidden",
          marginBottom: spacing.sm,
        }}
      >
        <LinearGradient
          colors={isDone ? ["#22C55E", "#16A34A"] : ["#3B6DF5", "#6366F1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: "100%",
            width: `${percent}%`,
          }}
        />
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: colors.textSecondary,
            fontWeight: "600",
          }}
        >
          {percent}% complete
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="gift-outline" size={14} color={colors.warning} />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              color: colors.textPrimary,
              marginLeft: 4,
            }}
          >
            Prize {formatMoney(target.prizeAmount)}
          </Text>
        </View>
      </View>

      {/* Awarded banner */}
      {target.awarded ? (
        <View
          style={{
            marginTop: spacing.md,
            paddingVertical: 8,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.successSoft,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text
            style={{
              color: colors.success,
              fontSize: 12,
              fontWeight: "700",
              marginLeft: 6,
            }}
          >
            Prize {formatMoney(target.awarded.prizeAmount)} credited
          </Text>
        </View>
      ) : null}

      {!target.awarded && isDone ? (
        <Text
          style={{
            marginTop: spacing.md,
            fontSize: 11,
            color: colors.textMuted,
            fontWeight: "600",
          }}
        >
          Prize will credit at the start of next month.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({});
