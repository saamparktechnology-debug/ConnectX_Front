// src/app/index.tsx
import { ratingsApi } from "@/api/ratings";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/auth/authStore";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "expo-router";

export default function Index() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  // Fetch fresh user state
  const { data: me, isLoading: loadingMe } = useQuery({
    queryKey: ["me"],
    queryFn: () => usersApi.getMe(),
    enabled: status === "authenticated",
    staleTime: 0,
  });

  // Fetch pending rating — only males rate (females don't get prompted)
  const isMale = user?.gender === "male";
  const { data: pendingRating, isLoading: loadingRating } = useQuery({
    queryKey: ["ratings", "pending"],
    queryFn: () => ratingsApi.getPending(),
    enabled: status === "authenticated" && isMale,
    staleTime: 0,
  });

  if (status === "boot") return null;

  if (status !== "authenticated" || !user) {
    return <Redirect href="/(auth)/phone" />;
  }

  // Wait for the fresh snapshot before routing
  if (loadingMe) return null;
  if (isMale && loadingRating) return null;

  const liveStatus = me?.verificationStatus ?? user.verificationStatus;

  // Onboarding gate
  if (!user.onboardingCompleted) {
    return <Redirect href="/(onboarding)/profile" />;
  }

  // Female verification gate
  const needsVoice =
    user.gender === "female" &&
    (liveStatus === "unverified" || liveStatus === "rejected");

  if (needsVoice) {
    return <Redirect href="/(onboarding)/voice" />;
  }

  // Male with outstanding rating → force rating first
  if (isMale && pendingRating) {
    return <Redirect href="/rating/pending" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
