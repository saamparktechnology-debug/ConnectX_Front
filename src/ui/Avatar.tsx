import { PRESET_AVATARS } from "@/config/avatars";
import { useTheme } from "@/theme";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "./Text";

type Props = {
  uri?: string | null;
  name: string;
  size?: number;
  presence?: "online" | "busy" | "offline";
};

export function Avatar({ uri, name, size = 48, presence }: Props) {
  const { colors } = useTheme();
  const initials = name.trim().slice(0, 2).toUpperCase();

  const presetId = uri?.startsWith("preset:")
    ? uri.replace("preset:", "")
    : null;
  const preset = presetId
    ? PRESET_AVATARS.find((p) => p.id === presetId)
    : null;

  const isRemoteOrLocal =
    uri && (uri.startsWith("http") || uri.startsWith("file://"));

  return (
    <View style={{ width: size, height: size }}>
      {isRemoteOrLocal ? (
        <Image
          source={{ uri: uri! }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.surfaceRaised,
          }}
        />
      ) : preset ? (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: preset.bg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: preset.fg,
              fontSize: size / 2.6,
              fontWeight: "700",
            }}
          >
            {initials}
          </Text>
        </View>
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            variant="bodyStrong"
            color="primary"
            style={{ fontSize: size / 2.8 }}
          >
            {initials}
          </Text>
        </View>
      )}

      {presence ? (
        <View
          style={[
            styles.presence,
            {
              backgroundColor:
                presence === "online"
                  ? colors.online
                  : presence === "busy"
                    ? colors.busy
                    : colors.offline,
              borderColor: colors.surface,
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: size * 0.14,
              borderWidth: 2,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  presence: {
    position: "absolute",
    right: -2,
    bottom: -2,
  },
});
