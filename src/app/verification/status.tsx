// src/app/verification/status.tsx
import { useAuthStore } from "@/auth/authStore";
import { useTheme } from "@/theme";
import { Button, Card, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

const REASON_LABELS: Record<string, string> = {
  voice_unclear: "Voice not clear",
  ai_voice: "Suspected AI voice",
  language_mismatch: "Language does not match profile",
  abusive_content: "Abusive or inappropriate recording",
  suspended: "Account suspended",
  other: "Other",
};

export default function VerificationStatusScreen() {
  const router = useRouter();
  const { spacing, colors, radius } = useTheme();
  const user = useAuthStore((s) => s.user);

  const status = user?.verificationStatus ?? "unverified";
  const reason = user?.verificationRejectionReason;
  const note = user?.verificationRejectionNote;

  const copy = {
    unverified: {
      icon: "alert-circle-outline" as const,
      iconColor: colors.warning,
      title: "Verification required",
      body: "Complete voice verification to start receiving calls.",
      cta: "Start verification",
      ctaRoute: "/(onboarding)/voice" as const,
    },
    pending: {
      icon: "hourglass-outline" as const,
      iconColor: colors.warning,
      title: "Verification in review",
      body: "Our team is listening to your voice sample. This usually takes less than 24 hours.",
      cta: null,
      ctaRoute: null,
    },
    approved: {
      icon: "checkmark-circle-outline" as const,
      iconColor: colors.success,
      title: "You are verified",
      body: "Your voice is confirmed. You can go online and receive calls.",
      cta: null,
      ctaRoute: null,
    },
    rejected: {
      icon: "close-circle-outline" as const,
      iconColor: colors.danger,
      title: "Verification rejected",
      body: reason
        ? "Please review the reason below and re-record your voice verification."
        : "Please re-record your voice verification.",
      cta: "Re-record",
      ctaRoute: "/(onboarding)/voice" as const,
    },
  }[status];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.xl }}>
        <View style={{ alignItems: "center", marginTop: spacing.xl }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.surfaceRaised,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={copy.icon} size={56} color={copy.iconColor} />
          </View>

          <Text
            variant="h2"
            style={{ marginTop: spacing.xl, textAlign: "center" }}
          >
            {copy.title}
          </Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginTop: spacing.sm, textAlign: "center" }}
          >
            {copy.body}
          </Text>
        </View>

        {/* Rejection reason card (only when rejected) */}
        {status === "rejected" && reason ? (
          <Card
            style={{
              marginTop: spacing.xl,
              borderColor: colors.danger,
              backgroundColor: colors.dangerSoft,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Ionicons name="alert-circle" size={20} color={colors.danger} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text variant="bodyStrong" color="danger">
                  {REASON_LABELS[reason] ?? "Rejected"}
                </Text>
                {note ? (
                  <Text
                    variant="body"
                    color="textSecondary"
                    style={{ marginTop: spacing.xs, lineHeight: 22 }}
                  >
                    {note}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
        ) : null}

        {copy.cta && copy.ctaRoute ? (
          <View style={{ marginTop: spacing["2xl"] }}>
            <Button
              label={copy.cta}
              variant="rose"
              onPress={() => router.push(copy.ctaRoute!)}
            />
          </View>
        ) : null}

        {/* Info about why we verify */}
        <Card style={{ marginTop: spacing.xl }}>
          <Text variant="caption" color="textSecondary">
            Why we verify
          </Text>
          <Text
            variant="body"
            style={{ marginTop: spacing.sm, lineHeight: 22 }}
          >
            Voice verification helps us:
          </Text>
          <View style={{ marginTop: spacing.sm, gap: 6 }}>
            <Bullet text="Confirm that real women are on the platform" />
            <Bullet text="Detect AI-generated voices" />
            <Bullet text="Keep users safe and build trust" />
            <Bullet text="Match you with callers in your language" />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Bullet({ text }: { text: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
      <View
        style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.rose,
          marginTop: 9,
          marginRight: spacing.sm,
        }}
      />
      <Text variant="body" color="textSecondary" style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
