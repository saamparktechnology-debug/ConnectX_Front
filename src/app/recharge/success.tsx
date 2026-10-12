// src/app/recharge/success.tsx
import { walletApi } from "@/api/wallet";
import { useTheme } from "@/theme";
import { Button, Card, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const MAX_WAIT_SEC = 30;

export default function RechargeSuccessScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const queryClient = useQueryClient();
  const { rechargeUuid } = useLocalSearchParams<{ rechargeUuid: string }>();

  const [elapsed, setElapsed] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  // Poll wallet history every 2s — look for a credit with our recharge reference
  const { data: txs } = useQuery({
    queryKey: ["wallet", "history", "recharge-poll"],
    queryFn: () => walletApi.getHistory(5, 0),
    refetchInterval: confirmed ? false : 2000,
    enabled: !confirmed,
  });

  useEffect(() => {
    if (!txs) return;
    // Look for a recent recharge credit
    const hit = txs.find(
      (t) =>
        t.type === "recharge" &&
        t.direction === "credit" &&
        (t.reference_uuid === rechargeUuid ||
          (t.metadata && (t.metadata as any).recharge_uuid === rechargeUuid) ||
          // fallback: a very recent recharge credit within the last 2 minutes
          Date.now() - new Date(t.created_at).getTime() < 120_000),
    );
    if (hit) setConfirmed(true);
  }, [txs, rechargeUuid]);

  useEffect(() => {
    if (confirmed) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [confirmed]);

  useEffect(() => {
    if (confirmed) {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  }, [confirmed, queryClient]);

  const goHome = () => {
    router.replace("/(tabs)/wallet");
  };

  if (confirmed) {
    return (
      <Screen>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.successSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={64}
              color={colors.success}
            />
          </View>

          <Text variant="h2" style={{ marginTop: spacing.xl }}>
            Recharge successful
          </Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginTop: spacing.sm, textAlign: "center" }}
          >
            Your wallet balance has been updated.
          </Text>

          <View
            style={{ marginTop: spacing["3xl"], width: "100%", maxWidth: 300 }}
          >
            <Button label="Back to wallet" variant="rose" onPress={goHome} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colors.rose} />

        <Text variant="h3" style={{ marginTop: spacing.xl }}>
          Verifying payment…
        </Text>
        <Text
          variant="body"
          color="textSecondary"
          style={{ marginTop: spacing.sm, textAlign: "center" }}
        >
          This usually takes a few seconds.
        </Text>

        <Card style={{ marginTop: spacing.xl, width: "100%" }}>
          <Text variant="small" color="textMuted">
            Waiting · {MAX_WAIT_SEC - elapsed}s remaining
          </Text>
        </Card>

        {elapsed >= MAX_WAIT_SEC ? (
          <View style={{ marginTop: spacing.xl, width: "100%", maxWidth: 320 }}>
            <Text
              variant="body"
              color="textSecondary"
              align="center"
              style={{ marginBottom: spacing.md }}
            >
              We haven't seen the credit yet. If your bank shows the payment, it
              will reflect in a few minutes.
            </Text>
            <Button label="Back to wallet" variant="outline" onPress={goHome} />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
