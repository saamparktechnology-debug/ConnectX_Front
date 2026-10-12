// LOGIC PRESERVED: same props (edges, padded, style, children).
// VISUAL CHANGES: wraps in gradient background.

import { GradientBackground } from "@/theme/GradientBackground";
import { StyleSheet, View, ViewProps } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

type Props = ViewProps & {
  edges?: Edge[];
  padded?: boolean;
};

export function Screen({
  edges = ["top", "bottom"],
  padded = true,
  style,
  children,
  ...rest
}: Props) {
  return (
    <GradientBackground>
      <SafeAreaView edges={edges} style={styles.safe}>
        <View
          style={[styles.inner, padded && { paddingHorizontal: 16 }, style]}
          {...rest}
        >
          {children}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
});
