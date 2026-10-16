// src/features/calls/useCallSocket.ts
import { useAuthStore } from "@/auth/authStore";
import { walletKeys } from "@/features/wallet/useBalance";
import { showToast } from "@/lib/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useCallStore } from "./callStore";
import { connectSocket, disconnectSocket, subscribe } from "./socketClient";

type IncomingPayload = {
  sessionUuid: string;
  roomId: string;
  callerId: number;
  callerNickname: string;
  callerAvatar: string | null;
  callerLanguage: string | null;
  secondsUntilExpiry: number;
};

export function useCallSocket() {
  const status = useAuthStore((s) => s.status);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setIncoming = useCallStore((s) => s.setIncoming);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status !== "authenticated") {
      disconnectSocket();
      return;
    }

    let cancelled = false;
    const unsubs: Array<() => void> = [];

    (async () => {
      try {
        await connectSocket();
        if (cancelled) return;

        // ── call:incoming ────────────────────────────────────────
        unsubs.push(
          await subscribe<IncomingPayload>("call:incoming", (payload) => {
            const phase = useCallStore.getState().phase;
            if (phase !== "idle") return;

            console.log("[socket] call:incoming", payload.sessionUuid);

            setIncoming({
              sessionUuid: payload.sessionUuid,
              roomId: payload.roomId,
              peerNickname: payload.callerNickname,
              peerUuid: String(payload.callerId),
              peerAvatarUrl: payload.callerAvatar,
            });
          }),
        );

        unsubs.push(
          await subscribe<{ type: string; message: string; senderId: number }>(
            "notification:new",
            (payload) => {
              if (payload.type === "female_online") {
                queryClient.invalidateQueries({ queryKey: ["notifications"] });
              }
            },
          ),
        );

        // ── wallet:updated ───────────────────────────────────────
        unsubs.push(
          await subscribe<{ balance: string }>("wallet:updated", (payload) => {
            console.log("[socket] wallet:updated →", payload.balance);
            updateUser({ walletBalance: payload.balance });
            queryClient.setQueryData(walletKeys.balance, {
              balance: payload.balance,
            });
            queryClient.invalidateQueries({
              queryKey: ["wallet", "history"],
            });
          }),
        );

        // ── verification:updated ─────────────────────────────────
        unsubs.push(
          await subscribe<{ status: string; reason?: string; note?: string }>(
            "verification:updated",
            (payload) => {
              console.log("[socket] verification:updated →", payload.status);
              updateUser({
                verificationStatus: payload.status as
                  | "unverified"
                  | "pending"
                  | "approved"
                  | "rejected",
              });
              queryClient.invalidateQueries({ queryKey: ["me"] });
            },
          ),
        );

        unsubs.push(
          await subscribe<{
            sessionUuid: string;
            roomId: string;
            callerId: number;
            callerNickname: string;
            callerAvatar: string | null;
            secondsUntilExpiry: number;
          }>("call:random-incoming", (payload) => {
            const phase = useCallStore.getState().phase;
            if (phase !== "idle") return;
            setIncoming({
              sessionUuid: payload.sessionUuid,
              roomId: payload.roomId,
              peerNickname: payload.callerNickname,
              peerUuid: String(payload.callerId),
              peerAvatarUrl: payload.callerAvatar,
            });
          }),
        );

        unsubs.push(
          await subscribe<{ sessionUuid: string }>("call:random-taken", () => {
            const phase = useCallStore.getState().phase;
            if (phase === "incoming") {
              useCallStore.getState().clear();
            }
          }),
        );

        unsubs.push(
          await subscribe<{
            periodYear: number;
            periodMonth: number;
            achievedMinutes: number;
            prizeAmount: string;
          }>("target:awarded", (payload) => {
            console.log("[socket] target:awarded", payload);
            queryClient.invalidateQueries({ queryKey: ["target", "me"] });
            queryClient.invalidateQueries({ queryKey: ["wallet"] });
            queryClient.invalidateQueries({ queryKey: ["me"] });
            showToast(
              `Target prize ₹${payload.prizeAmount} credited!`,
              "success",
            );
          }),
        );

        unsubs.push(
          await subscribe<{
            sessionUuid: string;
            balance: string;
            remainingSeconds: number;
          }>("call:low-balance", (payload) => {
            const call = useCallStore.getState().call;
            if (!call || call.sessionUuid !== payload.sessionUuid) return;
            showToast(
              `Low balance: ₹${payload.balance} (${Math.floor(payload.remainingSeconds / 60)}m left)`,
              "warning",
            );
          }),
        );

        unsubs.push(
          await subscribe<{ sessionUuid: string }>(
            "call:balance-exhausted",
            (payload) => {
              const call = useCallStore.getState().call;
              if (!call || call.sessionUuid !== payload.sessionUuid) return;
              showToast("Call ended: insufficient balance", "error");
              // The active screen's socket subscriber will pick up the `call:ended`
              // event that the sweeper's endCall triggers.
            },
          ),
        );
      } catch (err) {
        console.log("[socket] setup failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [status, setIncoming, updateUser, queryClient]);
}
