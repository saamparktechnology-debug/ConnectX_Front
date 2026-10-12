// src/app/settings/privacy.tsx
import { useTheme } from "@/theme";
import { Screen, Text } from "@/ui";
import { ScrollView } from "react-native";

export default function PrivacyScreen() {
  const { spacing } = useTheme();
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.xl }}>
        <Text variant="display" style={{ marginBottom: spacing.lg }}>
          Privacy Policy
        </Text>
        <Text variant="body" color="textSecondary" style={{ lineHeight: 24 }}>
          {/* Replace with real content before launch */}
          connectx24 respects your privacy. We collect only what is required to
          provide the service: phone number, nickname, and optional voice
          verification.{"\n\n"}
          We do not sell your data to third parties.{"\n\n"}
          Voice recordings are encrypted at rest and accessible only to
          verification reviewers.{"\n\n"}
          You can request deletion of your account at any time by contacting
          support@connectx24.com.
        </Text>
      </ScrollView>
    </Screen>
  );
}
