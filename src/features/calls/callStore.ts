// src/features/calls/callStore.ts
import { create } from "zustand";

export type CallRole = "caller" | "receiver";

export type CallPhase =
  | "idle"
  | "outgoing" // caller waiting for receiver to accept
  | "incoming" // receiver seeing the ring modal
  | "connecting" // accepted, joining the room
  | "active" // in the call
  | "ended"; // call finished

export type ActiveCall = {
  sessionUuid: string;
  roomId: string;
  role: CallRole;
  peerNickname: string;
  peerUuid: string;
  peerAvatarUrl?: string | null;
  startedAt: number; // ms epoch when the phase changed
  acceptedAt?: number | null; // ms epoch when accepted
  token?: string | null; // ZEGOCLOUD room token
};

/**
 * Input shape for startOutgoing / setIncoming.
 * `role` and `startedAt` are populated by the store itself.
 */
export type StartCallInput = Omit<ActiveCall, "role" | "startedAt">;

type CallState = {
  phase: CallPhase;
  call: ActiveCall | null;

  setPhase: (phase: CallPhase) => void;
  startOutgoing: (call: StartCallInput) => void;
  setIncoming: (call: StartCallInput) => void;
  markAccepted: (token: string) => void;
  setActive: () => void;
  clear: () => void;
};

export const useCallStore = create<CallState>((set, get) => ({
  phase: "idle",
  call: null,

  setPhase: (phase) => set({ phase }),

  startOutgoing: (call) => {
    set({
      phase: "outgoing",
      call: { ...call, role: "caller", startedAt: Date.now() },
    });
  },

  setIncoming: (call) => {
    // Don't override an existing active call
    const current = get().phase;
    if (
      current === "active" ||
      current === "connecting" ||
      current === "incoming"
    ) {
      return;
    }
    set({
      phase: "incoming",
      call: { ...call, role: "receiver", startedAt: Date.now() },
    });
  },

  markAccepted: (token) => {
    const call = get().call;
    if (!call) return;
    set({
      phase: "connecting",
      call: { ...call, token, acceptedAt: Date.now() },
    });
  },

  setActive: () => set({ phase: "active" }),

  clear: () => set({ phase: "idle", call: null }),
}));
