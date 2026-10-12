// src/app/recharge/amount.tsx
import { userMessage } from "@/api/errors";
import { rechargesApi } from "@/api/recharges";
import { AmountPicker } from "@/features/recharge/AmountPicker";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Screen, Text } from "@/ui";
import { useMutation } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

function uuidv4(): string {
  // expo-crypto provides randomUUID in SDK 50+
  // Fallback to Math.random if unavailable
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

export default function RechargeAmountScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const [amount, setAmount] = useState<number | null>(null);

  const initiate = useMutation({
    mutationFn: () => {
      const idem = uuidv4();
      return rechargesApi.initiate(amount!, idem);
    },
    onSuccess: (data) => {
      router.push({
        pathname: "/recharge/webview",
        params: {
          url: data.payuCheckoutUrl,
          paramsJson: JSON.stringify(data.params),
          rechargeUuid: data.rechargeUuid,
        },
      });
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

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
            <Text variant="display">Recharge</Text>
            <Text
              variant="body"
              color="textSecondary"
              style={{ marginTop: spacing.sm }}
            >
              Top up your wallet to place calls. A 4% platform tax applies.
            </Text>
          </View>

          <AmountPicker value={amount} onChange={setAmount} />

          <View style={{ marginTop: spacing.xl }}>
            <Button
              label={
                amount
                  ? `Proceed to pay ₹${(amount * 1.04).toFixed(2)}`
                  : "Enter an amount"
              }
              variant="rose"
              loading={initiate.isPending}
              disabled={!amount || amount < 10 || amount > 50000}
              onPress={() => initiate.mutate()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
