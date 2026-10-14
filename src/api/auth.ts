import { post } from "./client";

export type SendOtpResponse = { debugOtp?: string };

export type VerifyOtpInput = {
  phone: string;
  otp: string;
  deviceId: string;
};

export type VerifyOtpResponse =
  | {
      onboardingRequired: true;
      onboardingToken: string;
      accessToken: null;
      refreshToken: null;
      user: null;
    }
  | {
      onboardingRequired: false;
      onboardingToken: null;
      accessToken: string;
      refreshToken: string;
      user: {
        id: number;
        uuid: string;
        publicId: string | null;
        phone: string;
        gender: "male" | "female";
        nickname: string;
        avatarUrl: string | null;
        verificationStatus: "unverified" | "pending" | "approved" | "rejected";
        walletBalance: string;
        isOnline: boolean;
        onboardingCompleted: boolean;
        primaryLanguage: string | null;
        birthYear: number | null;
        termsAcceptedAt: string | null;
        channelsAcknowledgedAt: string | null;
      };
    };

export type CompleteSignupResponse = {
  accessToken: string;
  refreshToken: string;
  user: NonNullable<
    Extract<VerifyOtpResponse, { onboardingRequired: false }>["user"]
  >;
};

export const authApi = {
  sendOtp(phone: string) {
    return post<SendOtpResponse>("/auth/otp/send", { phone });
  },

  verifyOtp(input: VerifyOtpInput) {
    return post<VerifyOtpResponse>("/auth/otp/verify", input);
  },

  completeSignup(input: {
    onboardingToken: string;
    gender: "male" | "female";
    nickname: string;
    birthYear?: number | null;
    avatarUrl?: string | null;
  }) {
    return post<CompleteSignupResponse>("/users/onboarding/create", input);
  },

  logout(refreshToken: string) {
    return post<{ ok: true }>("/auth/logout", { refreshToken });
  },
};
