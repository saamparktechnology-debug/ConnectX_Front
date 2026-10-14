import { get, patch, post } from "./client";

export type AppConfig = {
  terms_female: string;
  whatsapp_url: string;
  youtube_url: string;
  instagram_url: string;
};

export const configApi = {
  get() {
    return get<AppConfig>("/config");
  },
  acceptTerms() {
    return post<{ ok: boolean }>("/users/me/accept-terms", {});
  },
  acknowledgeChannels(input: {
    whatsapp: boolean;
    youtube: boolean;
    instagram: boolean;
  }) {
    return post<{ ok: boolean }>("/users/me/acknowledge-channels", input);
  },
};

export const adminConfigApi = {
  list() {
    return get<
      Array<{ config_key: string; config_value: string; updated_at: string }>
    >("/admin/config");
  },
  update(key: string, value: string) {
    return patch<{ key: string; value: string }>(`/admin/config/${key}`, {
      value,
    });
  },
};
