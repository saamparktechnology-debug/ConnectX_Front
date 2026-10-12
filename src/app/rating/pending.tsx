// src/app/rating/pending.tsx
import { userMessage } from "@/api/errors";
import { ratingsApi, type PendingRating } from "@/api/ratings";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Input, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

export default function RatingPendingScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const { data, isLoading } = useQuery<PendingRating>({
    queryKey: ["ratings", "pending"],
    queryFn: () => ratingsApi.getPending(),
    staleTime: 0,
  });

  const submit = useMutation({
    mutationFn: () => {
      if (!data) throw new Error("No pending rating");
      return ratingsApi.submit(data.callId, rating, review || undefined);
    },
    onSuccess: () => {
      showToast("Thanks for your feedback!", "success");
      router.replace("/(tabs)/home");
    },
    onError: (err) => showToast(userMessage(err), "error"),
  });

  const skip = () => router.replace("/(tabs)/home");

  if (isLoading) {
    return (
      <Screen>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text variant="body" color="textSecondary">
            Loading…
          </Text>
        </View>
      </Screen>
    );
  }

  if (!data) {
    // No pending rating — go home
    router.replace("/(tabs)/home");
    return null;
  }

  return (
    <Screen>
      <View style={{ flex: 1, paddingVertical: spacing["3xl"] }}>
        <View style={{ alignItems: "center", marginBottom: spacing["3xl"] }}>
          <Text variant="h2">How was your call?</Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginTop: spacing.sm }}
          >
            with {data.companionName}
          </Text>
        </View>

        {/* Star rating */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: spacing.md,
            marginBottom: spacing["3xl"],
          }}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setRating(n)}>
              <Ionicons
                name={n <= rating ? "star" : "star-outline"}
                size={44}
                color={n <= rating ? colors.warning : colors.textMuted}
              />
            </Pressable>
          ))}
        </View>

        {/* Review */}
        <Input
          label="Add a comment (optional)"
          placeholder="How was the experience?"
          value={review}
          onChangeText={setReview}
          maxLength={500}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: "top" }}
        />

        <View style={{ flex: 1 }} />

        <Button
          label="Submit"
          variant="rose"
          loading={submit.isPending}
          disabled={rating === 0}
          onPress={() => submit.mutate()}
        />

        <Pressable
          onPress={skip}
          style={{
            marginTop: spacing.md,
            paddingVertical: spacing.md,
            alignItems: "center",
          }}
        >
          <Text variant="body" color="textMuted">
            Skip for now
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
