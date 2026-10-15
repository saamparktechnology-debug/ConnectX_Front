import { ratingsApi } from "@/api/ratings";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/auth/authStore";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "expo-router";

export default function Index() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const { data: me, isLoading: loadingMe } = useQuery({
    queryKey: ["me"],
    queryFn: () => usersApi.getMe(),
    enabled: status === "authenticated",
    staleTime: 0,
  });

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

  if (loadingMe) return null;
  if (isMale && loadingRating) return null;

  // Prefer server state over the local snapshot for anything that
  // the signup flow may have completed after the snapshot was saved.
  const liveOnboardingCompleted =
    me?.onboardingCompleted ?? user.onboardingCompleted;
  const livePrimaryLanguage = me?.primaryLanguage ?? user.primaryLanguage;
  const liveStatus = me?.verificationStatus ?? user.verificationStatus;

  if (!liveOnboardingCompleted) {
    return <Redirect href="/(onboarding)/profile" />;
  }

  if (user.gender === "female") {
    if (!livePrimaryLanguage) {
      return <Redirect href="/(onboarding)/language" />;
    }

    const needsVoice = liveStatus === "unverified" || liveStatus === "rejected";
    if (needsVoice) return <Redirect href="/(onboarding)/voice" />;

    const termsOk = Boolean(me?.termsAcceptedAt ?? user.termsAcceptedAt);
    const channelsOk = Boolean(
      me?.channelsAcknowledgedAt ?? user.channelsAcknowledgedAt,
    );
    if (!termsOk) return <Redirect href="/(onboarding)/terms" />;
    if (!channelsOk) return <Redirect href="/(onboarding)/channels" />;
  }

  if (isMale && pendingRating) {
    return <Redirect href="/rating/pending" />;
  }

  return <Redirect href="/(tabs)/home" />;
}
