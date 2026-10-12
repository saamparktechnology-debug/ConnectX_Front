import type { DiscoverableFemale } from "@/api/users";
import { findLanguage } from "@/config/languages";
import { useTheme } from "@/theme";
import { Avatar, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  companion: DiscoverableFemale;
  onPress: () => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  star: "Star",
  relationship: "Relationship",
  marriage: "Marriage",
  confidence: "Confidence",
  friendly: "Friendly",
};

export function CompanionCard({ companion, onPress }: Props) {
  const { colors } = useTheme();

  const isOnline = Boolean(companion.is_online);
  const language = companion.primary_language
    ? (findLanguage(companion.primary_language)?.name ??
      companion.primary_language)
    : "Hindi";

  const publicId = companion.public_id ?? "—";
  const tag = companion.category_tag
    ? (CATEGORY_LABELS[companion.category_tag] ?? companion.category_tag)
    : "Friendly";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.surfacePressed : colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={{ flexDirection: "row", padding: 8 }}>
        <View style={{ width: 60, alignItems: "center" }}>
          <View>
            <Avatar
              uri={companion.avatar_url}
              name={companion.nickname}
              size={52}
            />
            {isOnline ? (
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: colors.online,
                    borderColor: colors.surface,
                  },
                ]}
              />
            ) : null}
          </View>

          {isOnline ? (
            <View
              style={[
                styles.onlinePill,
                { borderColor: colors.online, backgroundColor: colors.surface },
              ]}
            >
              <Text
                style={{ color: colors.online, fontSize: 8, fontWeight: "800" }}
              >
                Online
              </Text>
            </View>
          ) : null}

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={9} color={colors.gold} />
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 10,
                fontWeight: "700",
                marginLeft: 2,
              }}
            >
              4.5
            </Text>
          </View>
        </View>

        <View
          style={{ flex: 1, marginLeft: 8, justifyContent: "space-between" }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 14,
                  fontWeight: "800",
                }}
                numberOfLines={1}
              >
                {companion.nickname}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 10,
                  fontWeight: "600",
                  marginLeft: 4,
                }}
              >
                • 24
              </Text>
            </View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 9,
                fontWeight: "600",
                marginLeft: 4,
              }}
            >
              {language}
            </Text>
          </View>

          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 10,
              fontWeight: "600",
              marginTop: 1,
            }}
            numberOfLines={1}
          >
            India ·{" "}
            <Text style={{ color: colors.primary, fontWeight: "800" }}>
              {publicId}
            </Text>
          </Text>

          <Text
            style={{
              color: "#E8457C",
              fontSize: 11,
              fontWeight: "700",
              marginTop: 1,
            }}
          >
            {tag}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 13,
                fontWeight: "800",
              }}
            >
              ₹3/min
            </Text>

            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onPress();
              }}
              style={({ pressed }) => [
                styles.callBtn,
                {
                  backgroundColor: pressed
                    ? colors.primaryPressed
                    : colors.primary,
                },
              ]}
            >
              <Ionicons name="call" size={11} color="#FFFFFF" />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: "700",
                  marginLeft: 3,
                }}
              >
                Call Now
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
  },
  onlineDot: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  onlinePill: {
    alignSelf: "center",
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    borderWidth: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
});
