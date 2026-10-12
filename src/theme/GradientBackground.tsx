// New component. Screens use it via <Screen>.

import { useTheme } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

type Props = ViewProps & { children: React.ReactNode };

export function GradientBackground({ children, style, ...rest }: Props) {
  const { colors, activeScheme } = useTheme();

  if (activeScheme === "dark") {
    return (
      <View
        style={[styles.root, { backgroundColor: colors.bg }, style]}
        {...rest}
      >
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
      locations={[0, 0.55, 1]}
      style={[styles.root, style]}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
