import { get, post } from "./client";

export type Notification = {
  id: number;
  type: "female_online";
  message: string;
  read_at: string | null;
  created_at: string;
  sender_id: number;
  sender_public_id: string | null;
  sender_nickname: string;
  sender_avatar: string | null;
  sender_online: 0 | 1 | boolean;
};

export const notificationsApi = {
  list(limit = 30) {
    return get<{ notifications: Notification[] }>(
      `/users/me/notifications?limit=${limit}`,
    );
  },

  markRead() {
    return post<{ ok: boolean }>("/users/me/notifications/read", {});
  },
};
