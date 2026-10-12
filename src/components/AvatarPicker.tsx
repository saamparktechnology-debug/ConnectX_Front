import { userMessage } from "@/api/errors";
import { usersApi } from "@/api/users";
import { PRESET_AVATARS, type PresetAvatar } from "@/config/avatars";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Text } from "@/ui";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

type Props = {
  nickname: string;
  value: string | null;
  onChange: (uri: string) => void;
  /** Called after a successful upload with the final public URL */
  onUploadComplete?: (url: string) => void;
};

export function AvatarPicker({
  nickname,
  value,
  onChange,
  onUploadComplete,
}: Props) {
  const { colors, spacing, radius } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const handlePresetPress = (preset: PresetAvatar) => {
    onChange(`preset:${preset.id}`);
  };

  const handleUploadPress = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permission needed",
        "We need access to your photos to pick an avatar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const mime = asset.mimeType ?? "image/jpeg";

    // Show the local preview immediately while uploading
    onChange(asset.uri);

    // Upload to CDN
    setUploading(true);
    setUploadPercent(0);
    try {
      const uploaded = await usersApi.uploadAvatar(
        asset.uri,
        mime,
        setUploadPercent,
      );
      console.log("[avatar] uploaded:", uploaded.avatarUrl);
      // Replace local URI with the public URL so it persists across devices
      onChange(uploaded.avatarUrl);
      onUploadComplete?.(uploaded.avatarUrl);
      showToast("Avatar updated", "success");
    } catch (err) {
      console.log("[avatar] upload error:", err);
      showToast(userMessage(err), "error");
      // Keep the local preview but warn it won't persist
    } finally {
      setUploading(false);
    }
  };

  const isPresetUri = value?.startsWith("preset:");
  const presetId = isPresetUri ? value!.replace("preset:", "") : null;
  const preset = PRESET_AVATARS.find((p) => p.id === presetId);
  const isLocalFile = value?.startsWith("file://");
  const isHttp = value?.startsWith("http");
  const previewUri = !isPresetUri && value ? value : null;

  const initial = nickname.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <View>
      {/* Preview */}
      <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
        <View
          style={[
            styles.preview,
            {
              borderColor: colors.border,
              backgroundColor: preset?.bg ?? colors.surfaceRaised,
            },
          ]}
        >
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.previewImage} />
          ) : preset ? (
            <Text
              style={{
                fontSize: 48,
                fontWeight: "700",
                color: preset.fg,
              }}
            >
              {initial}
            </Text>
          ) : (
            <Text
              style={{
                fontSize: 48,
                fontWeight: "700",
                color: colors.primary,
              }}
            >
              {initial}
            </Text>
          )}

          {uploading ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: "rgba(0,0,0,0.6)",
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <ActivityIndicator color="#FFFFFF" />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 12,
                  fontWeight: "600",
                  marginTop: 6,
                }}
              >
                {uploadPercent}%
              </Text>
            </View>
          ) : null}
        </View>

        {isLocalFile && !uploading ? (
          <Text
            variant="small"
            color="warning"
            style={{ marginTop: spacing.sm }}
          >
            Not uploaded — other users won't see this yet
          </Text>
        ) : null}

        {isHttp ? (
          <Text
            variant="small"
            color="success"
            style={{ marginTop: spacing.sm }}
          >
            ✓ Uploaded
          </Text>
        ) : null}
      </View>

      {/* Preset row */}
      <Text
        variant="caption"
        color="textSecondary"
        style={{ marginBottom: spacing.sm }}
      >
        Pick a color
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: spacing.md,
          paddingRight: spacing.lg,
        }}
      >
        {PRESET_AVATARS.map((p) => {
          const selected = value === `preset:${p.id}`;
          return (
            <Pressable
              key={p.id}
              onPress={() => handlePresetPress(p)}
              disabled={uploading}
              style={[
                styles.swatch,
                {
                  backgroundColor: p.bg,
                  borderColor: selected ? colors.rose : "transparent",
                  borderWidth: selected ? 3 : 0,
                  opacity: uploading ? 0.5 : 1,
                },
              ]}
            >
              <Text style={{ color: p.fg, fontWeight: "700" }}>{initial}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Upload button */}
      <Pressable
        onPress={handleUploadPress}
        disabled={uploading}
        style={{
          marginTop: spacing.lg,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          alignItems: "center",
          opacity: uploading ? 0.5 : 1,
        }}
      >
        <Text variant="bodyStrong" color="textPrimary">
          {uploading ? "Uploading…" : "Upload from device"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
