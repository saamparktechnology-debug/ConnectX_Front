import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="language" />
      <Stack.Screen name="voice" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="channels" />
    </Stack>
  );
}
