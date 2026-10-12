// src/components/ErrorBoundary.tsx
import { useTheme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
  onReset?: () => void;
};

type State = {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): State {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.log("[ErrorBoundary] caught:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  reset = () => {
    this.setState({ error: null, errorInfo: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return <ErrorFallback error={this.state.error} onReset={this.reset} />;
  }
}

function ErrorFallback({
  error,
  onReset,
}: {
  error: Error;
  onReset: () => void;
}) {
  return (
    <BoundaryView>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedContent error={error} onReset={onReset} />
      </ScrollView>
    </BoundaryView>
  );
}

function BoundaryView({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      {children}
    </View>
  );
}

function ThemedContent({
  error,
  onReset,
}: {
  error: Error;
  onReset: () => void;
}) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={{ paddingHorizontal: spacing.xl, alignItems: "center" }}>
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.dangerSoft,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing.xl,
        }}
      >
        <Ionicons name="warning-outline" size={56} color={colors.danger} />
      </View>

      <Text
        style={{
          color: colors.textPrimary,
          fontSize: 22,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        Something went wrong
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: "center",
          marginTop: spacing.sm,
          lineHeight: 20,
        }}
      >
        The app ran into an unexpected problem. Try again — if it keeps
        happening, close and reopen the app.
      </Text>

      <View
        style={{
          marginTop: spacing.xl,
          padding: spacing.md,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          width: "100%",
        }}
      >
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 11,
            fontWeight: "600",
            marginBottom: 4,
          }}
        >
          Technical details
        </Text>
        <Text
          style={{ color: colors.textSecondary, fontSize: 12 }}
          numberOfLines={4}
        >
          {error?.message ?? "Unknown error"}
        </Text>
      </View>

      <Pressable
        onPress={onReset}
        style={{
          marginTop: spacing.xl,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderRadius: radius.lg,
          backgroundColor: colors.rose,
        }}
      >
        <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
