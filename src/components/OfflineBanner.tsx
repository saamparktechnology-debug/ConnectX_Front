// src/components/OfflineBanner.tsx
import { useTheme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function OfflineBanner() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const slide = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(
        state.isConnected && state.isInternetReachable !== false
      );
      setIsOffline(offline);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: isOffline ? 0 : -100,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isOffline, slide]);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.warning,
          paddingTop: insets.top + 6,
          transform: [{ translateY: slide }],
        },
      ]}
      pointerEvents="none"
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 6,
          paddingHorizontal: spacing.lg,
        }}
      >
        <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: "600",
            marginLeft: 6,
          }}
        >
          No internet connection
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
  },
});
