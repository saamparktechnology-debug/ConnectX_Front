import { api, ApiSuccess, get, patch, post } from "./client";

export type DiscoverableFemale = {
  id: number;
  uuid: string;
  public_id: string | null;
  nickname: string;
  avatar_url: string | null;
  primary_language: string | null;
  category_tag: string | null;
  is_online: 0 | 1 | boolean;
  last_seen_at: string | null;
};

export type MeResponse = {
  id: number;
  uuid: string;
  publicId: string | null;
  phone: string;
  gender: "male" | "female";
  nickname: string;
  avatarUrl: string | null;
  primaryLanguage: string | null;
  verificationStatus: "unverified" | "pending" | "approved" | "rejected";
  verificationRejectionReason: string | null;
  verificationRejectionNote: string | null;
  accountState: "active" | "suspended" | "banned" | "deactivated";
  isOnline: boolean;
  walletBalance: string;
  onboardingCompleted: boolean;
  birthYear: number | null;
};

export type SendOtpResponse = { debugOtp?: string };

export type AvatarUploadResponse = {
  avatarUrl: string;
  sizeBytes: number;
  mime: string;
};

export const usersApi = {
  discover(limit = 20, offset = 0) {
    return get<DiscoverableFemale[]>(
      `/users/discover?limit=${limit}&offset=${offset}`,
    );
  },

  getMe() {
    return get<MeResponse>("/users/me");
  },

  updateMe(input: {
    nickname?: string;
    avatarUrl?: string | null;
    primaryLanguage?: string;
  }) {
    return patch<{
      nickname: string;
      avatarUrl: string | null;
      primaryLanguage?: string;
    }>("/users/me", input);
  },

  requestPhoneChange(newPhone: string) {
    return post<SendOtpResponse>("/users/me/phone/request", { newPhone });
  },

  verifyPhoneChange(newPhone: string, otp: string) {
    return post<{ phone: string; forceLogout: boolean }>(
      "/users/me/phone/verify",
      { newPhone, otp },
    );
  },

  deleteAccount(reason: string, confirmText: string) {
    return post<{ deleted: boolean }>("/users/me/delete", {
      reason,
      confirmText,
    });
  },

  async uploadAvatar(
    uri: string,
    mimeType: string,
    onProgress?: (percent: number) => void,
  ): Promise<AvatarUploadResponse> {
    const filename = uri.split("/").pop() ?? "avatar.jpg";

    const form = new FormData();
    form.append("avatar", {
      uri,
      name: filename,
      type: mimeType,
    } as any);

    const resp = await api.post<ApiSuccess<AvatarUploadResponse>>(
      "/users/avatar",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      },
    );

    return resp.data.data;
  },

  searchFemales(params: {
    limit?: number;
    offset?: number;
    search?: string;
    language?: string;
    category?: string;
  }) {
    const qs = new URLSearchParams();
    qs.set("limit", String(params.limit ?? 20));
    qs.set("offset", String(params.offset ?? 0));
    if (params.search) qs.set("search", params.search);
    if (params.language) qs.set("language", params.language);
    if (params.category && params.category !== "all")
      qs.set("category", params.category);

    return get<{
      females: DiscoverableFemale[];
      total: number;
      limit: number;
      offset: number;
    }>(`/users/discover?${qs.toString()}`);
  },
};
