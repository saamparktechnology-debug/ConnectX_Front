// src/features/recharge/AmountPicker.tsx
import { useTheme } from "@/theme";
import { Card, Input, Text } from "@/ui";
import { useState } from "react";
import { Pressable, View } from "react-native";

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export function AmountPicker({ value, onChange }: Props) {
  const { colors, spacing, radius } = useTheme();
  const [custom, setCustom] = useState("");

  const handleQuick = (n: number) => {
    setCustom("");
    onChange(n);
  };

  const handleCustom = (txt: string) => {
    setCustom(txt.replace(/\D/g, ""));
    const n = parseInt(txt.replace(/\D/g, ""), 10);
    onChange(Number.isFinite(n) && n >= 10 ? n : null);
  };

  return (
    <View>
      <Text
        variant="caption"
        color="textSecondary"
        style={{ marginBottom: spacing.sm }}
      >
        Quick amounts
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing.sm,
          marginBottom: spacing.lg,
        }}
      >
        {QUICK_AMOUNTS.map((n) => {
          const selected = value === n && !custom;
          return (
            <Pressable
              key={n}
              onPress={() => handleQuick(n)}
              style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderRadius: radius.full,
                borderWidth: 1,
                borderColor: selected ? colors.rose : colors.border,
                backgroundColor: selected ? colors.roseSoft : colors.surface,
              }}
            >
              <Text
                variant="bodyStrong"
                color={selected ? "rose" : "textPrimary"}
              >
                ₹{n}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        label="Or enter custom amount"
        keyboardType="number-pad"
        value={custom}
        onChangeText={handleCustom}
        placeholder="₹ 10 – ₹ 50,000"
        leftSlot={
          <Text variant="bodyStrong" color="textSecondary">
            ₹
          </Text>
        }
      />

      {value ? (
        <Card
          style={{
            marginTop: spacing.md,
            backgroundColor: colors.primarySoft,
            borderColor: colors.primary,
          }}
        >
          <Text variant="caption" color="textSecondary">
            Summary
          </Text>
          <Row label="Base amount" value={`₹${value.toFixed(2)}`} />
          <Row
            label="Platform tax (4%)"
            value={`₹${(value * 0.04).toFixed(2)}`}
          />
          <Row label="You pay" value={`₹${(value * 1.04).toFixed(2)}`} bold />
          <View
            style={{
              marginTop: spacing.sm,
              paddingTop: spacing.sm,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: colors.border,
            }}
          >
            <Text variant="small" color="textMuted">
              ₹{value.toFixed(2)} will be credited to your wallet.
            </Text>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

function Row({
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
        marginTop: 6,
      }}
    >
      <Text variant={bold ? "bodyStrong" : "body"} color="textSecondary">
        {label}
      </Text>
      <Text variant={bold ? "bodyStrong" : "body"}>{value}</Text>
    </View>
  );
}

// Import at top of file if not present:
import { StyleSheet } from "react-native";
