import { usersApi } from "@/api/users";
import { useAuthStore } from "@/auth/authStore";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OfflineBanner } from "@/components/OfflineBanner";
import { IncomingCallOverlay } from "@/features/calls/IncomingCallOverlay";
import { useCallSocket } from "@/features/calls/useCallSocket";
import { ThemeProvider, useTheme } from "@/theme";
import { LoadingOverlay, ToastProvider } from "@/ui";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function BootGate() {
  const { activeScheme } = useTheme();
  const status = useAuthStore((s) => s.status);
  const hydrate = useAuthStore((s) => s.hydrate);
  const router = useRouter();

  useCallSocket();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // ── Deep link handling ─────────────────────────────────────────
  useEffect(() => {
    const handleUrl = async (url: string) => {
      try {
        const parsed = Linking.parse(url);
        const { hostname, path, queryParams } = parsed;
        console.log("[deeplink] received:", {
          url,
          hostname,
          path,
          queryParams,
        });

        // connectx24://call/<sessionUuid>
        if (
          hostname === "call" &&
          typeof path === "string" &&
          path.length > 1
        ) {
          const sessionUuid = path.replace(/^\//, "");
          if (sessionUuid) {
            router.push({
              pathname: "/call/active",
              params: { sessionUuid },
            });
            return;
          }
        }

        // connectx24://verification
        if (hostname === "verification") {
          router.push("/verification/status" as never);
          return;
        }

        // connectx24://settings
        if (hostname === "settings") {
          router.push("/settings" as never);
          return;
        }

        // connectx24://recharge/success?rechargeUuid=...
        if (hostname === "recharge" && path === "/success") {
          const rechargeUuid =
            typeof queryParams?.rechargeUuid === "string"
              ? queryParams.rechargeUuid
              : "";
          router.push({
            pathname: "/recharge/success",
            params: { rechargeUuid },
          });
          return;
        }

        // connectx24://profile
        if (hostname === "profile") {
          router.push("/(tabs)/profile" as never);
          return;
        }

        // Unknown deep link → log only
        console.log("[deeplink] unhandled:", { hostname, path });
      } catch (err) {
        console.log("[deeplink] parse error:", err);
      }
    };

    // Cold start
    Linking.getInitialURL()
      .then((url) => {
        if (url) handleUrl(url);
      })
      .catch(() => {
        /* non-fatal */
      });

    // Warm start (app in background)
    const sub = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    return () => sub.remove();
  }, [router]);
  // ───────────────────────────────────────────────────────────────

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => usersApi.getMe(),
    enabled: status === "authenticated",
    staleTime: 60_000,
    refetchOnMount: "always",
  });

  useEffect(() => {
    if (!me) return;
    const current = useAuthStore.getState().user;
    if (!current) return;

    const changed =
      current.publicId !== me.publicId ||
      current.verificationStatus !== me.verificationStatus ||
      current.verificationRejectionReason !== me.verificationRejectionReason ||
      current.verificationRejectionNote !== me.verificationRejectionNote ||
      current.walletBalance !== me.walletBalance ||
      current.isOnline !== me.isOnline ||
      current.avatarUrl !== me.avatarUrl ||
      current.nickname !== me.nickname;

    if (!changed) return;

    useAuthStore.getState().updateUser({
      publicId: me.publicId,
      verificationStatus: me.verificationStatus,
      verificationRejectionReason: me.verificationRejectionReason,
      verificationRejectionNote: me.verificationRejectionNote,
      walletBalance: me.walletBalance,
      isOnline: me.isOnline,
      avatarUrl: me.avatarUrl ?? current.avatarUrl ?? null,
      nickname: me.nickname,
    });
  }, [me]);

  if (status === "boot") {
    return (
      <>
        <StatusBar style={activeScheme === "dark" ? "light" : "dark"} />
        <LoadingOverlay visible message="Loading connectx24…" />
      </>
    );
  }

  return (
    <>
      <StatusBar style={activeScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="notifications" options={{ presentation: "card" }} />
      </Stack>
      <IncomingCallOverlay />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <ToastProvider>
                <BootGate />
                <OfflineBanner />
              </ToastProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
