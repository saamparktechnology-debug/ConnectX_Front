// src/ui/Input.tsx
import { useTheme } from "@/theme";
import React, { forwardRef, useState } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";
import { Text } from "./Text";

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  hint?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, hint, leftSlot, rightSlot, style, onFocus, onBlur, ...rest },
  ref,
) {
  const { colors, radius, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text
          variant="caption"
          color="textSecondary"
          style={{ marginBottom: spacing.xs }}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.row,
          {
            borderColor,
            borderWidth: focused ? 1.5 : 1,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.md,
            height: 52,
          },
        ]}
      >
        {leftSlot ? (
          <View style={{ marginRight: spacing.sm }}>{leftSlot}</View>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          style={[
            typography.body,
            { flex: 1, color: colors.textPrimary, paddingVertical: 0 },
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightSlot ? (
          <View style={{ marginLeft: spacing.sm }}>{rightSlot}</View>
        ) : null}
      </View>

      {error ? (
        <Text variant="small" color="danger" style={{ marginTop: spacing.xs }}>
          {error}
        </Text>
      ) : hint ? (
        <Text
          variant="small"
          color="textMuted"
          style={{ marginTop: spacing.xs }}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
});
