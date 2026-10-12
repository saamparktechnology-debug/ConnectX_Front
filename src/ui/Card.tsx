// LOGIC PRESERVED: interactive, onPress, padded, style, children.
// VISUAL CHANGES: 16px radius, thinner border, no shadow.

import { useTheme } from "@/theme";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewProps,
} from "react-native";

type BaseProps = ViewProps & {
  interactive?: boolean;
  onPress?: PressableProps["onPress"];
  padded?: boolean;
};

export function Card({
  interactive,
  onPress,
  padded = true,
  style,
  children,
  ...rest
}: BaseProps) {
  const { colors } = useTheme();

  const baseStyle = [
    styles.base,
    {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      padding: padded ? 16 : 0,
    },
    style,
  ];

  if (interactive && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...baseStyle,
          pressed && { backgroundColor: colors.surfacePressed },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={baseStyle} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
  },
});
