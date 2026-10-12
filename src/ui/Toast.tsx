// src/ui/Toast.tsx
import { useTheme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

export type ToastKind = "success" | "error" | "warning" | "info";

export type ToastMessage = {
  id: string;
  kind: ToastKind;
  message: string;
};

type Props = {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  duration?: number;
};

const ICONS: Record<ToastKind, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  error: "close-circle",
  warning: "alert-circle",
  info: "information-circle",
};

const SCREEN_WIDTH = Dimensions.get("window").width;

export function Toast({ toast, onDismiss, duration = 3200 }: Props) {
  const { colors, spacing, radius, shadows } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 220,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss(toast.id));
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss, translateY, opacity]);

  const palette = {
    success: {
      bg: colors.successSoft,
      fg: colors.success,
      border: colors.success,
    },
    error: {
      bg: colors.dangerSoft,
      fg: colors.danger,
      border: colors.danger,
    },
    warning: {
      bg: colors.warningSoft,
      fg: colors.warning,
      border: colors.warning,
    },
    info: {
      bg: colors.infoSoft,
      fg: colors.info,
      border: colors.info,
    },
  }[toast.kind];

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.toast,
          shadows.md,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            borderRadius: radius.lg,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <Ionicons name={ICONS[toast.kind]} size={22} color={palette.fg} />
        <Text
          style={{
            flex: 1,
            marginLeft: spacing.sm,
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "500",
          }}
          numberOfLines={3}
        >
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  toast: {
    width: "100%",
    maxWidth: SCREEN_WIDTH - 32,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
});
