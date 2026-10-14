import { useTheme } from "@/theme";
import { Button, Input, Screen, Text } from "@/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

export default function NicknameScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const params = useLocalSearchParams<{
    phone: string;
    deviceId: string;
    onboardingToken: string;
    gender: "male" | "female";
  }>();

  const isFemale = params.gender === "female";
  const [nickname, setNickname] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const currentYear = new Date().getFullYear();
  const nicknameValid =
    nickname.trim().length >= 2 && nickname.trim().length <= 64;

  const birthYearNum = parseInt(birthYear, 10);
  const birthYearValid =
    !isFemale ||
    (birthYear.length === 4 &&
      birthYearNum >= 1900 &&
      birthYearNum <= currentYear - 18);

  const canContinue = nicknameValid && birthYearValid;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push({
      pathname: "/(auth)/avatar",
      params: {
        phone: params.phone,
        deviceId: params.deviceId,
        onboardingToken: params.onboardingToken,
        gender: params.gender,
        nickname: nickname.trim(),
        birthYear: isFemale ? birthYear : "",
      },
    });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "center" }}
      >
        <View style={{ marginBottom: spacing["3xl"] }}>
          <Text variant="display">A bit about you</Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginTop: spacing.sm }}
          >
            This is how you'll appear on Connect24x.
          </Text>
        </View>

        <Input
          label="Nickname"
          value={nickname}
          onChangeText={setNickname}
          maxLength={64}
          placeholder="How should people see you?"
          hint="2–64 characters."
        />

        {isFemale ? (
          <Input
            label="Year of birth"
            keyboardType="number-pad"
            maxLength={4}
            value={birthYear}
            onChangeText={(t) => setBirthYear(t.replace(/\D/g, ""))}
            placeholder="1998"
            hint="You must be 18+ to use Connect24x."
          />
        ) : null}

        <Button
          label="Continue"
          variant="rose"
          disabled={!canContinue}
          onPress={handleContinue}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
