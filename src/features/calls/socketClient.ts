// src/features/calls/socketClient.ts
import { tokenStore } from "@/auth/secureStore";
import { env } from "@/config/env";
import { io, Socket } from "socket.io-client";

/**
 * Singleton Socket.IO client.
 *
 * - Reads the access token from SecureStore on every connect/reconnect
 * - Auto-reconnects with exponential backoff
 * - Subscribers receive an unsubscribe function
 *
 * Derives the socket URL from env.API_BASE_URL by stripping `/api/v1`.
 */

let socket: Socket | null = null;
let connecting: Promise<Socket> | null = null;

function deriveSocketUrl(): string {
  // https://xxx.ngrok-free.app/api/v1 → https://xxx.ngrok-free.app
  return env.API_BASE_URL.replace(/\/api\/v1\/?$/, "");
}

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  if (connecting) return connecting;

  connecting = (async () => {
    const token = await tokenStore.getAccess();
    if (!token) throw new Error("No access token — cannot open socket");

    const url = deriveSocketUrl();

    const s = io(url, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
      timeout: 15_000,
      autoConnect: true,
    });

    // Re-read the token before each reconnect attempt
    s.io.on("reconnect_attempt", async () => {
      const fresh = await tokenStore.getAccess();
      if (fresh) s.auth = { token: fresh };
    });

    // Helpful dev logging
    s.on("connect", () => console.log("[socket] connected", s.id));
    s.on("disconnect", (reason) =>
      console.log("[socket] disconnected:", reason),
    );
    s.on("connect_error", (err) =>
      console.log("[socket] connect_error:", err.message),
    );

    socket = s;
    return s;
  })();

  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

/**
 * Subscribe to a socket event. Returns an unsubscribe function.
 * Waits for the connection to be established before registering.
 */
export async function subscribe<T>(
  event: string,
  handler: (payload: T) => void,
): Promise<() => void> {
  const s = await connectSocket();
  s.on(event, handler as (payload: unknown) => void);
  return () => {
    s.off(event, handler as (payload: unknown) => void);
  };
}
