// src/app/settings/terms.tsx
import { useTheme } from "@/theme";
import { Screen, Text } from "@/ui";
import { ScrollView } from "react-native";

export default function TermsScreen() {
  const { spacing } = useTheme();
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.xl }}>
        <Text variant="display" style={{ marginBottom: spacing.lg }}>
          Terms of Service
        </Text>
        <Text variant="body" color="textSecondary" style={{ lineHeight: 24 }}>
          {/* Replace with real content before launch */}
          These Terms of Service govern your use of connect4. By using the app
          you agree to comply with all applicable laws and to treat other users
          with respect.{"\n\n"}
          You must be 18 years or older to use connectx.{"\n\n"}
          Voice recordings, when submitted for verification, are used solely for
          identity confirmation and are stored securely.{"\n\n"}
          Content that violates our community guidelines may result in account
          suspension or termination.
        </Text>
      </ScrollView>
    </Screen>
  );
}
