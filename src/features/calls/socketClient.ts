// src/features/calls/socketClient.ts
import { tokenStore } from "@/auth/secureStore";
import { env } from "@/config/env";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let connecting: Promise<Socket> | null = null;

function deriveSocketUrl(): string {
  return env.API_BASE_URL.replace(/\/api\/v1\/?$/, "");
}

export async function connectSocket(): Promise<Socket> {
  if (socket) {
    if (!socket.connected && !socket.active) {
      socket.connect();
    }
    return socket;
  }
  if (connecting) return connecting;

  connecting = (async () => {
    const url = deriveSocketUrl();

    const s = io(url, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      // Dynamically read the latest token from SecureStore on EVERY connection/reconnection
      auth: async (cb) => {
        const freshToken = await tokenStore.getAccess();
        cb({ token: freshToken });
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15_000,
      autoConnect: true,
    });

    s.on("connect", () => console.log("[socket] connected", s.id));
    s.on("disconnect", (reason) =>
      console.log("[socket] disconnected:", reason),
    );
    s.on("connect_error", async (err) => {
      console.log("[socket] connect_error:", err.message);
      // When server middleware rejects with INVALID_TOKEN, socket.io stops retrying automatically.
      // Wait 1.5s (allowing HTTP client interceptor to refresh the token) and reconnect.
      if (err.message === "INVALID_TOKEN" || err.message === "NO_TOKEN") {
        setTimeout(async () => {
          const latest = await tokenStore.getAccess();
          if (latest && socket && !socket.connected) {
            socket.connect();
          }
        }, 1500);
      }
    });

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
