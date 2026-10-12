// src/ui/LoadingOverlay.tsx
import { useTheme } from "@/theme";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "./Text";

type Props = { visible: boolean; message?: string };

export function LoadingOverlay({ visible, message }: Props) {
  const { colors, spacing } = useTheme();
  if (!visible) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.overlay }]}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          paddingVertical: spacing.xl,
          paddingHorizontal: spacing["2xl"],
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={colors.rose} />
        {message ? (
          <Text
            variant="caption"
            color="textSecondary"
            style={{ marginTop: spacing.sm }}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
});
