// src/app/notifications.tsx
import {
  useMarkNotificationsRead,
  useNotifications,
} from "@/features/notifications/useNotifications";
import { timeAgo } from "@/lib/format";
import { useTheme } from "@/theme";
import { Avatar, Card, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { data, isLoading, refetch, isRefetching } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const clearAll = useMutation({
    mutationFn: async () => {
      const { post } = await import("@/api/client");
      return post("/users/me/notifications/clear", {});
    },
    onSuccess: () => refetch(),
  });

  useFocusEffect(
    useCallback(() => {
      markRead.mutate();
    }, []),
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/home" as never);
    }
  };

  const notifications = data?.notifications ?? [];

  return (
    <Screen padded={false}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
        }}
      >
        <Pressable onPress={handleBack} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text
          style={{ fontSize: 20, fontWeight: "800", marginLeft: 12, flex: 1 }}
        >
          Notifications
        </Text>
        {notifications.length > 0 ? (
          <Pressable onPress={() => clearAll.mutate()} hitSlop={8}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View style={{ paddingTop: 40, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Avatar
                  uri={item.sender_avatar}
                  name={item.sender_nickname}
                  size={44}
                  presence={Boolean(item.sender_online) ? "online" : "offline"}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800" }}>
                    {item.sender_nickname}
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 13,
                      fontWeight: "600",
                      marginTop: 2,
                    }}
                  >
                    {item.message}
                  </Text>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {timeAgo(item.created_at)}
                  </Text>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <Card>
              <Text style={{ fontWeight: "700" }}>No notifications yet</Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                Companions you've called will appear here when they go online.
              </Text>
            </Card>
          }
        />
      )}
    </Screen>
  );
}
