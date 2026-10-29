// src/app/(onboarding)/voice.tsx

import { userMessage } from "@/api/errors";
import { verificationsApi } from "@/api/verifications";
import { useAuthStore } from "@/auth/authStore";
import { findLanguage } from "@/config/languages";
import { getVoicePhrase } from "@/config/voice-phrases";
import { showToast } from "@/lib/toast";
import { useTheme } from "@/theme";
import { Button, Card, Screen, Text } from "@/ui";
import { Ionicons } from "@expo/vector-icons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
} from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

type Stage = "idle" | "recording" | "recorded" | "uploading";

const MAX_DURATION_SEC = 60;

export default function VoiceVerificationScreen() {
  const router = useRouter();
  const { spacing, colors, radius } = useTheme();
  const params = useLocalSearchParams<{ primaryLanguage?: string }>();

  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [stage, setStage] = useState<Stage>("idle");
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [uploadPercent, setUploadPercent] = useState(0);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(recordingUri ? { uri: recordingUri } : null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const primaryLanguage = params.primaryLanguage ?? "hi";
  const phrase = getVoicePhrase(primaryLanguage);
  const languageName =
    findLanguage(primaryLanguage)?.name ?? primaryLanguage.toUpperCase();

  // Request microphone permission on mount
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        showToast("Microphone permission required", "error");
      }
    })();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        showToast("Microphone permission required", "error");
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();

      setStage("recording");
      setElapsedSec(0);

      timerRef.current = setInterval(() => {
        setElapsedSec((s) => {
          const next = s + 1;
          if (next >= MAX_DURATION_SEC) {
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      console.log("[voice] recording error", err);
      showToast("Could not start recording", "error");
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      await recorder.stop();
      const uri = recorder.uri;

      if (!uri) {
        showToast("Recording failed", "error");
        setStage("idle");
        return;
      }

      setRecordingUri(uri);
      setDurationSec(elapsedSec);
      setStage("recorded");
    } catch (err) {
      console.log("[voice] stop error", err);
      setStage("idle");
    }
  };

  const playRecording = () => {
    if (!recordingUri) return;
    try {
      player.seekTo(0);
      player.play();
    } catch (err) {
      console.log("[voice] play error", err);
      showToast("Could not play recording", "error");
    }
  };

  const reRecord = () => {
    try {
      player.pause();
    } catch {
      // ignore
    }
    setRecordingUri(null);
    setDurationSec(0);
    setElapsedSec(0);
    setStage("idle");
  };

  const submitForReview = async () => {
    if (!recordingUri) return;
    if (durationSec < 5) {
      showToast("Recording must be at least 5 seconds", "warning");
      return;
    }

    setStage("uploading");
    setUploadPercent(0);

    try {
      const uploaded = await verificationsApi.uploadVoice(
        recordingUri,
        "audio/m4a",
        setUploadPercent,
      );
      // console.log("[voice] uploaded:", uploaded);

      const submitted = await verificationsApi.submitVoice({
        voiceUrl: uploaded.voiceUrl,
        durationSec,
        mime: uploaded.mime,
        sizeBytes: uploaded.sizeBytes,
      });
      console.log("[voice] submitted:", submitted);

      updateUser({ verificationStatus: "pending" });

      showToast("Verification submitted for review", "success");

      router.replace("/(onboarding)/terms" as never);
    } catch (err) {
      console.log("[voice] submit error", err);
      showToast(userMessage(err), "error");
      setStage("recorded");
    }
  };

  const formatSec = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingVertical: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: spacing["2xl"] }}>
          <Text variant="display">Verify your voice</Text>
          <Text
            variant="body"
            color="textSecondary"
            style={{ marginTop: spacing.sm }}
          >
            Read the phrase below aloud in your selected language. Our team
            listens to confirm your voice matches your profile.
          </Text>
        </View>

        {/* Phrase card */}
        <Card style={{ marginBottom: spacing.lg }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: spacing.sm,
            }}
          >
            <Text variant="small" color="textMuted">
              {languageName}
            </Text>
            <Text variant="small" color="textMuted">
              ~15–20 seconds
            </Text>
          </View>
          <Text
            variant="h3"
            style={{
              marginTop: spacing.xs,
              lineHeight: 32,
              fontSize: 18,
            }}
          >
            {phrase}
          </Text>
        </Card>

        {/* Status / controls */}
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={{ alignItems: "center" }}>
            <Text
              variant="mono"
              color={stage === "recording" ? "rose" : "textPrimary"}
              style={{ fontSize: 32, lineHeight: 40 }}
            >
              {stage === "recording"
                ? formatSec(elapsedSec)
                : formatSec(durationSec)}
            </Text>
            <Text
              variant="small"
              color="textMuted"
              style={{ marginTop: spacing.xs }}
            >
              {stage === "idle" && "Tap to record"}
              {stage === "recording" && "Recording…"}
              {stage === "recorded" && "Recorded — play or re-record"}
              {stage === "uploading" && `Uploading… ${uploadPercent}%`}
            </Text>

            {/* Record button */}
            {(stage === "idle" || stage === "recording") && (
              <Pressable
                onPress={stage === "idle" ? startRecording : stopRecording}
                style={[
                  styles.recordBtn,
                  {
                    backgroundColor:
                      stage === "recording" ? colors.danger : colors.rose,
                    marginTop: spacing.lg,
                  },
                ]}
              >
                <Ionicons
                  name={stage === "recording" ? "stop" : "mic"}
                  size={36}
                  color="#FFFFFF"
                />
              </Pressable>
            )}

            {/* Playback controls */}
            {stage === "recorded" && (
              <View
                style={{
                  flexDirection: "row",
                  gap: spacing.md,
                  marginTop: spacing.lg,
                }}
              >
                <Pressable
                  onPress={playRecording}
                  style={[
                    styles.smallBtn,
                    { borderColor: colors.border, borderRadius: radius.md },
                  ]}
                >
                  <Ionicons name="play" size={20} color={colors.textPrimary} />
                  <Text variant="body" style={{ marginLeft: spacing.xs }}>
                    Play
                  </Text>
                </Pressable>

                <Pressable
                  onPress={reRecord}
                  style={[
                    styles.smallBtn,
                    { borderColor: colors.border, borderRadius: radius.md },
                  ]}
                >
                  <Ionicons
                    name="refresh"
                    size={20}
                    color={colors.textPrimary}
                  />
                  <Text variant="body" style={{ marginLeft: spacing.xs }}>
                    Re-record
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </Card>

        <View style={{ flex: 1 }} />

        {stage === "recorded" && (
          <Button
            label="Submit for review"
            variant="rose"
            onPress={submitForReview}
            disabled={durationSec < 5}
          />
        )}

        {stage === "uploading" && (
          <Button
            label="Uploading…"
            variant="rose"
            loading
            disabled
            onPress={() => {}}
          />
        )}

        <Text
          variant="small"
          color="textMuted"
          align="center"
          style={{ marginTop: spacing.lg }}
        >
          {stage === "recorded" && durationSec < 5
            ? "Recording must be at least 5 seconds"
            : "You can re-record as many times as you need before submitting."}
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
});
