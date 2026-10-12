// LOGIC PRESERVED: label, variant, size, loading, fullWidth, leftIcon, disabled, onPress, style, rest.
// VISUAL CHANGES: fully rounded pills, blue default, bolder text.

import { useTheme } from "@/theme";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from "react-native";
import { Text } from "./Text";

type Variant =
  | "primary"
  | "rose"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline";
type Size = "sm" | "md" | "lg";

type Props = Omit<PressableProps, "style"> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  style?: any;
};

export function Button({
  label,
  variant = "rose",
  size = "md",
  loading = false,
  fullWidth = true,
  leftIcon,
  disabled,
  onPress,
  style,
  ...rest
}: Props) {
  const { colors, spacing } = useTheme();

  const heights: Record<Size, number> = { sm: 40, md: 52, lg: 60 };
  const fontSizes: Record<Size, number> = { sm: 14, md: 16, lg: 17 };

  const palette =
    variant === "primary" || variant === "rose"
      ? {
          bg: colors.primary,
          pressed: colors.primaryPressed,
          fg: "#FFFFFF",
          border: "transparent",
          borderWidth: 0,
        }
      : variant === "secondary"
        ? {
            bg: colors.surface,
            pressed: colors.surfacePressed,
            fg: colors.textPrimary,
            border: colors.border,
            borderWidth: 1.5,
          }
        : variant === "danger"
          ? {
              bg: colors.danger,
              pressed: colors.danger,
              fg: "#FFFFFF",
              border: "transparent",
              borderWidth: 0,
            }
          : variant === "outline"
            ? {
                bg: "transparent",
                pressed: colors.surfacePressed,
                fg: colors.primary,
                border: colors.primary,
                borderWidth: 1.5,
              }
            : {
                bg: "transparent",
                pressed: colors.surfacePressed,
                fg: colors.textPrimary,
                border: "transparent",
                borderWidth: 0,
              };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights[size],
          borderRadius: size === "sm" ? 20 : 999,
          paddingHorizontal: spacing.xl,
          backgroundColor: pressed ? palette.pressed : palette.bg,
          borderColor: palette.border,
          borderWidth: palette.borderWidth,
          opacity: isDisabled ? 0.55 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
      {...rest}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={palette.fg} />
        ) : (
          <>
            {leftIcon}
            <Text
              style={{
                color: palette.fg,
                fontSize: fontSizes[size],
                fontWeight: "700",
                marginLeft: leftIcon ? spacing.sm : 0,
              }}
            >
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
});
