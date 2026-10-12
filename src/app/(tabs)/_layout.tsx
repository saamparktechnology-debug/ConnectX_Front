// LOGIC PRESERVED:
//   - gender-aware tab list (isFemale hides search tab)
//   - all tab route names: home, search, calls, wallet, profile
//   - profile tab hidden (accessed via avatar)
// VISUAL CHANGES:
//   - active color = blue, inactive = muted
//   - lighter tab bar background
//   - filled icons (was outline)
//   - NO chat tab (not implemented yet)

import { useAuthStore } from "@/auth/authStore";
import { useTheme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { colors, activeScheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isFemale = user?.gender === "female";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: activeScheme === "dark" ? colors.surface : "#F0F0FA",
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              color={color}
              size={24}
            />
          ),
          href: isFemale ? null : undefined,
        }}
      />

      <Tabs.Screen
        name="wallet"
        options={{
          title: isFemale ? "Earnings" : "Wallet",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calls"
        options={{
          title: "Calls",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null, // accessed via avatar in home's top bar
        }}
      />
    </Tabs>
  );
}
