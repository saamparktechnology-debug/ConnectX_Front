// src/app/(onboarding)/profile.tsx

import { useAuthStore } from "@/auth/authStore";
import { AvatarPicker } from "@/components/AvatarPicker";
import { useTheme } from "@/theme";
import { Button, Input, Screen, Text } from "@/ui";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

/**
 * Step 1 of onboarding: avatar + birth year.
 *
 * Does NOT call the backend yet. Passes data forward to /onboarding/language
 * via route params, which then submits the whole payload in one call.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const user = useAuthStore((s) => s.user);

  const [birthYear, setBirthYear] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const isFemale = user?.gender === "female";
  const currentYear = new Date().getFullYear();

  const birthYearNum = parseInt(birthYear, 10);
  const birthYearValid =
    !isFemale ||
    (birthYear.length === 4 &&
      birthYearNum >= 1900 &&
      birthYearNum <= currentYear - 18);

  const avatarValid = !!avatar;
  const canContinue = birthYearValid && avatarValid;

  const handleContinue = () => {
    // Pass collected data to the language screen via params.
    // `birthYear` for male can be empty — backend will accept it.
    router.push({
      pathname: "/(onboarding)/language",
      params: {
        birthYear: isFemale ? birthYear : "",
        avatar: avatar ?? "",
      },
    });
  };

  if (!user) return null;

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingVertical: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: spacing["2xl"] }}>
            <Text variant="display">Almost there</Text>
            <Text
              variant="body"
              color="textSecondary"
              style={{ marginTop: spacing.sm }}
            >
              {isFemale
                ? "Tell us your birth year and pick an avatar."
                : "Pick an avatar to personalize your profile."}
            </Text>
          </View>

          {/* Avatar */}
          <Text variant="h3" style={{ marginBottom: spacing.md }}>
            Your avatar
          </Text>
          <AvatarPicker
            nickname={user.nickname}
            value={avatar}
            onChange={setAvatar}
          />

          {/* Birth year — female only */}
          {isFemale ? (
            <View style={{ marginTop: spacing["2xl"] }}>
              <Text variant="h3" style={{ marginBottom: spacing.md }}>
                Year of birth
              </Text>
              <Input
                label="YYYY"
                keyboardType="number-pad"
                maxLength={4}
                value={birthYear}
                onChangeText={(t) => setBirthYear(t.replace(/\D/g, ""))}
                placeholder="1998"
                hint="You must be 18+ to use connectx24."
              />
            </View>
          ) : null}

          <View style={{ marginTop: spacing["2xl"] }}>
            <Button
              label="Continue"
              variant="rose"
              disabled={!canContinue}
              onPress={handleContinue}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
