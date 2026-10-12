// src/api/auth.ts
import { post } from "./client";

export type SendOtpResponse = { debugOtp?: string };

export type VerifyOtpInput = {
  phone: string;
  otp: string;
  deviceId: string;
  gender?: "male" | "female";
  nickname?: string;
};

export type VerifyOtpResponse = {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: {
    id: number;
    uuid: string;
    publicId: string | null;
    phone: string;
    gender: "male" | "female";
    nickname: string;
    verificationStatus: "unverified" | "pending" | "approved" | "rejected";
    walletBalance: string;
    isOnline: boolean;
  };
};

export const authApi = {
  sendOtp(phone: string) {
    return post<SendOtpResponse>("/auth/otp/send", { phone });
  },

  verifyOtp(input: VerifyOtpInput) {
    return post<VerifyOtpResponse>("/auth/otp/verify", input);
  },

  logout(refreshToken: string) {
    return post<{ ok: true }>("/auth/logout", { refreshToken });
  },
};
