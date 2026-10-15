import {
  AudioModule,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useEffect, useRef } from "react";
import { useCallStore } from "./callStore";

const RINGTONE = require("../../../assets/ringtone.wav");

export function useIncomingRingtone() {
  const phase = useCallStore((s) => s.phase);
  const player = useAudioPlayer(RINGTONE);
  const status = useAudioPlayerStatus(player);
  const playingRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (phase !== "incoming") {
        if (playingRef.current) {
          try {
            player.pause();
            player.seekTo(0);
          } catch {
            /* noop */
          }
          playingRef.current = false;
        }
        return;
      }

      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
        });
        player.loop = true;
        player.volume = 1.0;
        player.seekTo(0);
        player.play();
        playingRef.current = true;
      } catch (e) {
        console.log("[ringtone] failed", e);
      }
    })();

    return () => {
      if (playingRef.current) {
        try {
          player.pause();
          player.seekTo(0);
        } catch {
          /* noop */
        }
        playingRef.current = false;
      }
    };
  }, [phase, player]);

  // Suppress unused warning
  void status;
  void AudioModule;
}
