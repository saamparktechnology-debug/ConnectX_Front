// LOGIC PRESERVED: label, selected, onPress, leftDot.
// VISUAL CHANGES: pink gradient when active, white + pink border when inactive.

import { useTheme } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leftDot?: "online" | "busy" | "offline";
};

export function Chip({ label, selected, onPress, leftDot }: Props) {
  const { colors } = useTheme();

  if (selected) {
    return (
      <Pressable onPress={onPress} style={styles.base}>
        <LinearGradient
          colors={[colors.chipActiveStart, colors.chipActiveEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.row}>
            {leftDot ? (
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      leftDot === "online"
                        ? colors.online
                        : leftDot === "busy"
                          ? colors.busy
                          : colors.offline,
                  },
                ]}
              />
            ) : null}
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderColor: colors.chipActiveStart,
          borderWidth: 1.5,
        },
      ]}
    >
      <View style={[styles.row, { paddingVertical: 9 }]}>
        {leftDot ? (
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  leftDot === "online"
                    ? colors.online
                    : leftDot === "busy"
                      ? colors.busy
                      : colors.offline,
              },
            ]}
          />
        ) : null}
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: 14,
            fontWeight: "700",
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    overflow: "hidden",
  },
  gradient: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});
