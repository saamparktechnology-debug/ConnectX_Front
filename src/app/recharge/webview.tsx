import { useTheme } from "@/theme";
import { Text } from "@/ui";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Linking, Platform, View } from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

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
          `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(
            String(v),
          )}" />`,
      )
      .join("\n");

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body onload="document.forms[0].submit()">
          <form method="POST" action="${escapeHtml(params.url ?? "")}">
            ${fields}
          </form>
        </body>
      </html>
    `;
  }, [params.url, params.paramsJson]);

  const closeWithSuccess = () => {
    router.replace({
      pathname: "/recharge/success",
      params: { rechargeUuid: params.rechargeUuid },
    });
  };

  const onShouldStartLoadWithRequest = (request: WebViewNavigation) => {
    const url = request.url ?? "";

    if (url.startsWith("http://") || url.startsWith("https://")) {
      if (
        url.includes("/recharges/payu/callback") ||
        url.includes("CALLBACK_PROCESSED")
      ) {
        closeWithSuccess();
        return false;
      }
      return true;
    }

    console.log("[payu-webview] external scheme:", url);
    Linking.openURL(url).catch((err) => {
      console.log("[payu-webview] openURL failed", err);
    });
    return false;
  };

  const onNavigationStateChange = (navState: WebViewNavigation) => {
    const url = navState.url ?? "";
    if (
      url.includes("/recharges/payu/callback") ||
      url.includes("CALLBACK_PROCESSED")
    ) {
      closeWithSuccess();
    }
  };

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
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        onNavigationStateChange={onNavigationStateChange}
        onMessage={(event) => {
          const data = event.nativeEvent.data ?? "";
          console.log("[payu-webview] postMessage:", data);
          if (data.includes("CALLBACK_PROCESSED_SUCCESSFULLY")) {
            closeWithSuccess();
          }
        }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        allowsInlineMediaPlayback
        mixedContentMode="always"
        thirdPartyCookiesEnabled
        {...(Platform.OS === "ios" ? { sharedCookiesEnabled: true } : {})}
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
