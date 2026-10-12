// src/features/calls/useCallSocketEvents.ts
import { useEffect, useState } from "react";
import { subscribe } from "./socketClient";

type AcceptedPayload = { sessionUuid: string };
type RejectedPayload = { sessionUuid: string };
type EndedPayload = { sessionUuid: string; endReason: string };

export type CallSocketEvent =
  | { type: "accepted"; at: number }
  | { type: "rejected"; at: number }
  | { type: "ended"; reason: string; at: number };

/**
 * Subscribes to call lifecycle events for a given session.
 * Returns the most recent matching event.
 */
export function useCallSocketEvents(
  sessionUuid: string | undefined | null,
): CallSocketEvent | null {
  const [event, setEvent] = useState<CallSocketEvent | null>(null);

  useEffect(() => {
    if (!sessionUuid) return;

    const unsubs: Array<() => void> = [];
    let cancelled = false;

    (async () => {
      const a = await subscribe<AcceptedPayload>("call:accepted", (p) => {
        if (cancelled) return;
        if (p.sessionUuid !== sessionUuid) return;
        setEvent({ type: "accepted", at: Date.now() });
      });
      unsubs.push(a);

      const b = await subscribe<RejectedPayload>("call:rejected", (p) => {
        if (cancelled) return;
        if (p.sessionUuid !== sessionUuid) return;
        setEvent({ type: "rejected", at: Date.now() });
      });
      unsubs.push(b);

      const c = await subscribe<EndedPayload>("call:ended", (p) => {
        if (cancelled) return;
        if (p.sessionUuid !== sessionUuid) return;
        setEvent({ type: "ended", reason: p.endReason, at: Date.now() });
      });
      unsubs.push(c);
    })();

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [sessionUuid]);

  return event;
}
