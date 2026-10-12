// src/app/(onboarding)/index.tsx

import { useAuthStore } from "@/auth/authStore";
import { Redirect } from "expo-router";

export default function OnboardingIndex() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Redirect href="/(auth)/phone" />;
  }

  // Female needs to complete profile (birth year + avatar).
  // We can't tell from the current snapshot alone whether she has,
  // so we route to profile and let it decide.
  return <Redirect href="/(onboarding)/profile" />;
}
