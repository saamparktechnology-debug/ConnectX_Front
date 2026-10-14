// src/app/(onboarding)/channels.tsx
import { configApi } from "@/api/config";
import { userMessage } from "@/api/errors";
import { useAuthStore } from "@/auth/authStore";
import { useAppConfig } from "@/features/onboarding/useAppConfig";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

type Channel = "whatsapp" | "youtube" | "instagram";

export default function ChannelsScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const { data } = useAppConfig();

  const [opened, setOpened] = useState<Record<Channel, boolean>>({
    whatsapp: false,
    youtube: false,
    instagram: false,
  });

  const open = async (channel: Channel, url: string | undefined) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
      setOpened((prev) => ({ ...prev, [channel]: true }));
    } catch {
      showToast("Could not open link", "error");
    }
  };

  const whatsappDone = opened.whatsapp;

  const submit = useMutation({
    mutationFn: () =>
      configApi.acknowledgeChannels({
        whatsapp: opened.whatsapp,
        youtube: opened.youtube,
        instagram: opened.instagram,
      }),
    onSuccess: () => {
      useAuthStore.setState((s) => ({
        user: s.user
          ? { ...s.user, channelsAcknowledgedAt: new Date().toISOString() }
          : null,
      }));
      router.replace("/(tabs)/home");
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.xl }}>
        <Text variant="h2">Join Our Community</Text>
        <Text variant="caption" color="textSecondary" style={{ marginTop: 4 }}>
          Follow us to stay updated and get the latest tips
        </Text>

        <ChannelRow
          icon="logo-whatsapp"
          iconColor="#25D366"
          label="Join WhatsApp Channel"
          subtitle="Required"
          required
          done={opened.whatsapp}
          onPress={() => open("whatsapp", data?.whatsapp_url)}
        />

        <ChannelRow
          icon="logo-youtube"
          iconColor="#FF0000"
          label="Subscribe on YouTube"
          subtitle="Recommended"
          done={opened.youtube}
          onPress={() => open("youtube", data?.youtube_url)}
        />

        <ChannelRow
          icon="logo-instagram"
          iconColor="#E1306C"
          label="Follow on Instagram"
          subtitle="Recommended"
          done={opened.instagram}
          onPress={() => open("instagram", data?.instagram_url)}
        />

        <View style={{ marginTop: spacing["2xl"] }}>
          <Button
            label={whatsappDone ? "Continue" : "Join WhatsApp to continue"}
            variant="rose"
            disabled={!whatsappDone}
            loading={submit.isPending}
            onPress={() => submit.mutate()}
          />
          {!whatsappDone ? (
            <Text
              variant="small"
              color="textMuted"
              align="center"
              style={{ marginTop: spacing.sm }}
            >
              WhatsApp channel is mandatory
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

function ChannelRow({
  icon,
  iconColor,
  label,
  subtitle,
  required,
  done,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  subtitle: string;
  required?: boolean;
  done: boolean;
  onPress: () => void;
}) {
  const { spacing, colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: done ? colors.success : colors.border,
      }}
    >
      <Ionicons name={icon} size={32} color={iconColor} />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <Text style={{ fontSize: 15, fontWeight: "800" }}>{label}</Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: required ? colors.danger : colors.textMuted,
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
      </View>
      <Ionicons
        name={done ? "checkmark-circle" : "chevron-forward"}
        size={22}
        color={done ? colors.success : colors.textMuted}
      />
    </Pressable>
  );
}
