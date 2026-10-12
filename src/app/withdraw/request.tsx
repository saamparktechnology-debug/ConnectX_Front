// src/app/withdraw/request.tsx
import { userMessage } from "@/api/errors";
import { withdrawalsApi } from "@/api/withdrawals";
import { useAuthStore } from "@/auth/authStore";
import { formatMoney } from "@/lib/format";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Card, Input, Screen, Text } from "@/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

function uuidv4(): string {
  try {
    return Crypto.randomUUID();
  } catch {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

const MIN_AMOUNT = 100;
const TAX_RATE = 0.025;

export default function WithdrawalRequestScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");

  const amountNum = parseFloat(amount);
  const amountValid = Number.isFinite(amountNum) && amountNum >= MIN_AMOUNT;
  const balanceNum = parseFloat(user?.walletBalance ?? "0");
  const enoughBalance = amountNum <= balanceNum;

  const tax = Number.isFinite(amountNum)
    ? Math.round(amountNum * TAX_RATE * 100) / 100
    : 0;
  const net = Number.isFinite(amountNum)
    ? Math.round((amountNum - tax) * 100) / 100
    : 0;

  const upiValid = /^[\w.-]+@[\w.-]+$/.test(upiId.trim());

  const submit = useMutation({
    mutationFn: () => {
      const idem = uuidv4();
      return withdrawalsApi.request(amountNum, upiId.trim(), idem);
    },
    onSuccess: () => {
      showToast("Withdrawal requested", "success");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.replace("/(tabs)/wallet");
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  const canSubmit =
    amountValid && upiValid && enoughBalance && !submit.isPending;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingVertical: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: spacing.xl }}>
            <Text variant="display">Withdraw</Text>
            <Text
              variant="body"
              color="textSecondary"
              style={{ marginTop: spacing.sm }}
            >
              Minimum ₹{MIN_AMOUNT}. A 2.5% processing fee applies.
            </Text>
          </View>

          <Card style={{ marginBottom: spacing.lg }}>
            <Text variant="caption" color="textSecondary">
              Available balance
            </Text>
            <Text variant="display" style={{ marginTop: spacing.xs }}>
              {formatMoney(balanceNum)}
            </Text>
          </Card>

          <Input
            label="Amount (₹)"
            keyboardType="number-pad"
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^\d.]/g, ""))}
            placeholder={`${MIN_AMOUNT} or more`}
            leftSlot={
              <Text variant="bodyStrong" color="textSecondary">
                ₹
              </Text>
            }
          />

          {amountValid && !enoughBalance ? (
            <Text
              variant="small"
              color="danger"
              style={{ marginBottom: spacing.md }}
            >
              Amount exceeds available balance.
            </Text>
          ) : null}

          <Input
            label="UPI ID"
            value={upiId}
            onChangeText={setUpiId}
            placeholder="yourname@okhdfcbank"
            autoCapitalize="none"
            autoCorrect={false}
            hint="Payout will be sent to this UPI ID."
          />

          {amountValid && upiValid ? (
            <Card
              style={{
                marginTop: spacing.md,
                backgroundColor: colors.primarySoft,
                borderColor: colors.primary,
              }}
            >
              <Row label="Requested" value={formatMoney(amountNum)} />
              <Row label="Tax (2.5%)" value={`- ${formatMoney(tax)}`} />
              <View style={styles.divider} />
              <Row label="You receive" value={formatMoney(net)} bold />
            </Card>
          ) : null}

          <View style={{ marginTop: spacing.xl }}>
            <Button
              label="Request withdrawal"
              variant="rose"
              loading={submit.isPending}
              disabled={!canSubmit}
              onPress={() => submit.mutate()}
            />
          </View>

          <Text
            variant="small"
            color="textMuted"
            align="center"
            style={{ marginTop: spacing.lg }}
          >
            Payouts are processed by our team within 24 hours.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
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

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#94A3B8",
    marginVertical: 8,
    opacity: 0.4,
  },
});
