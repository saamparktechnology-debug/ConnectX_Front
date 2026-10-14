import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Card, Screen, Text } from "@/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function GenderScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const params = useLocalSearchParams<{
    phone: string;
    deviceId: string;
    onboardingToken: string;
  }>();

  const [gender, setGender] = useState<"male" | "female" | null>(null);

  const handleContinue = () => {
    if (!gender) {
      showToast("Please select your gender", "warning");
      return;
    }
    router.push({
      pathname: "/(auth)/nickname",
      params: {
        phone: params.phone,
        deviceId: params.deviceId,
        onboardingToken: params.onboardingToken,
        gender,
      },
    });
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text variant="display">I am</Text>
        <Text
          variant="body"
          color="textSecondary"
          style={{ marginTop: spacing.sm, marginBottom: spacing["3xl"] }}
        >
          This helps us personalize your experience.
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: spacing.md,
            marginBottom: spacing.xl,
          }}
        >
          {(["male", "female"] as const).map((g) => (
            <Card
              key={g}
              interactive
              onPress={() => setGender(g)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: spacing["2xl"],
                borderColor: gender === g ? colors.rose : colors.border,
                borderWidth: gender === g ? 2 : 1,
              }}
            >
              <Text variant="h3" color={gender === g ? "rose" : "textPrimary"}>
                {g === "male" ? "Male" : "Female"}
              </Text>
            </Card>
          ))}
        </View>

        <Button
          label="Continue"
          variant="rose"
          disabled={!gender}
          onPress={handleContinue}
        />
      </View>
    </Screen>
  );
}
