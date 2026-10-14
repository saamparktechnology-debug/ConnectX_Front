// src/app/settings/about.tsx
import { useTheme } from "@/theme";
import { Card, Screen, Text } from "@/ui";
import { ScrollView, View } from "react-native";

export default function AboutScreen() {
  const { spacing } = useTheme();
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.xl }}>
        <Text variant="display" style={{ marginBottom: spacing.lg }}>
          About
        </Text>

        <Card>
          <Text variant="h3">connectx</Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginTop: spacing.sm, lineHeight: 22 }}
          >
            A voice-first platform connecting people through real conversations.
          </Text>

          <View style={{ marginTop: spacing.lg, gap: 6 }}>
            <Row label="Version" value="1.0.0" />
            <Row label="Build" value="dev" />
            <Row label="Support" value="support@connectx24.com" />
          </View>
        </Card>

        <Text
          variant="small"
          color="textMuted"
          align="center"
          style={{ marginTop: spacing.xl }}
        >
          © 2026 connectx24. All rights reserved.
        </Text>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text variant="body" color="textSecondary">
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}
