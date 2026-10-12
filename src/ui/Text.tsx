// LOGIC PRESERVED: variant, color, align, all RN text props.
// VISUAL CHANGES: added 'gold' color token.

import { useTheme } from "@/theme";
import { Text as RNText, TextProps as RNTextProps } from "react-native";

type Variant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "bodyStrong"
  | "caption"
  | "small"
  | "mono";

type ColorToken =
  | "textPrimary"
  | "textSecondary"
  | "textMuted"
  | "textDisabled"
  | "textOnRose"
  | "textOnPrimary"
  | "rose"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gold";

type Props = RNTextProps & {
  variant?: Variant;
  color?: ColorToken;
  align?: "auto" | "left" | "right" | "center";
};

export function Text({
  variant = "body",
  color = "textPrimary",
  align = "auto",
  style,
  children,
  ...rest
}: Props) {
  const { colors, typography } = useTheme();
  return (
    <RNText
      style={[
        typography[variant],
        { color: colors[color], textAlign: align },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}
