// src/auth/authStore.ts
import { create } from "zustand";
import { tokenStore, userSnapshotStore, type StoredUser } from "./secureStore";

export type AuthStatus = "boot" | "unauthenticated" | "authenticated";

type AuthState = {
  status: AuthStatus;
  user: StoredUser | null;
  accessToken: string | null;

  setSession: (payload: {
    user: StoredUser;
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;

  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<StoredUser>) => void;
  markOnboardingComplete: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "boot",
  user: null,
  accessToken: null,

  setSession: async ({ user, accessToken, refreshToken }) => {
    await tokenStore.saveTokens(accessToken, refreshToken);
    await userSnapshotStore.save(user);
    set({ status: "authenticated", user, accessToken });
  },

  hydrate: async () => {
    try {
      const [access, refresh, snapshot] = await Promise.all([
        tokenStore.getAccess(),
        tokenStore.getRefresh(),
        userSnapshotStore.load(),
      ]);
      if (access && refresh && snapshot) {
        set({
          status: "authenticated",
          user: snapshot,
          accessToken: access,
        });
      } else {
        set({ status: "unauthenticated", user: null, accessToken: null });
      }
    } catch {
      set({ status: "unauthenticated", user: null, accessToken: null });
    }
  },

  logout: async () => {
    // Best-effort: revoke the refresh token on the server.
    // If the network fails, still clear local state — the user is logging out.
    try {
      const refresh = await tokenStore.getRefresh();
      if (refresh) {
        const { authApi } = await import("@/api/auth");
        await authApi.logout(refresh).catch(() => {});
      }
    } catch {
      /* ignore */
    }
    await tokenStore.clear();
    set({ status: "unauthenticated", user: null, accessToken: null });
  },

  updateUser: (partial) => {
    const current = get().user;
    if (!current) return;
    const merged = { ...current, ...partial };
    set({ user: merged });
    userSnapshotStore.save(merged).catch(() => {});
  },

  markOnboardingComplete: () => {
    const current = get().user;
    if (!current) return;
    const merged = { ...current, onboardingCompleted: true };
    set({ user: merged });
    userSnapshotStore.save(merged).catch(() => {});
  },
}));
