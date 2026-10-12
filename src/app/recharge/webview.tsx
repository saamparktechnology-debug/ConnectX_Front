// src/app/recharge/webview.tsx
import { useTheme } from "@/theme";
import { Text } from "@/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";

/**
 * PayU checkout WebView.
 *
 * Flow:
 *   1. Build a self-submitting HTML form containing all PayU params
 *   2. Load it via WebView source={{ html }}
 *   3. PayU redirects to the backend callback URL on success/failure
 *   4. Backend responds with plain text "CALLBACK_PROCESSED_SUCCESSFULLY"
 *   5. We detect that string in onNavigationStateChange and route to /success
 */
export default function PayUWebViewScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    url: string;
    paramsJson: string;
    rechargeUuid: string;
  }>();

  const [loading, setLoading] = useState(true);

  const html = useMemo(() => {
    const payuParams = JSON.parse(params.paramsJson || "{}") as Record<
      string,
      string
    >;
    const fields = Object.entries(payuParams)
      .map(
        ([k, v]) =>
          `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(String(v))}" />`,
      )
      .join("\n");

    return `
      <!doctype html>
      <html>
        <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
        <body onload="document.forms[0].submit()">
          <form method="POST" action="${escapeHtml(params.url ?? "")}">
            ${fields}
          </form>
        </body>
      </html>
    `;
  }, [params.url, params.paramsJson]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {loading ? (
        <View style={{ padding: 24, alignItems: "center" }}>
          <ActivityIndicator color={colors.rose} />
          <Text
            variant="caption"
            color="textSecondary"
            style={{ marginTop: 8 }}
          >
            Loading secure payment…
          </Text>
        </View>
      ) : null}

      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(navState) => {
          const url = navState.url ?? "";
          // The backend's PayU callback returns this plain text on completion
          if (
            url.includes("/recharges/payu/callback") ||
            url.includes("CALLBACK_PROCESSED")
          ) {
            router.replace({
              pathname: "/recharge/success",
              params: { rechargeUuid: params.rechargeUuid },
            });
          }
        }}
        onMessage={(event) => {
          // Some PayU flows send a postMessage instead of a nav change
          const data = event.nativeEvent.data ?? "";
          if (data.includes("CALLBACK_PROCESSED_SUCCESSFULLY")) {
            router.replace({
              pathname: "/recharge/success",
              params: { rechargeUuid: params.rechargeUuid },
            });
          }
        }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
