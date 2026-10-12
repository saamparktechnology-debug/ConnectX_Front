// src/api/verifications.ts
import type { AxiosProgressEvent } from "axios";
import { api, ApiSuccess, post } from "./client";

export type VoiceUploadResponse = {
  voiceUrl: string;
  sizeBytes: number;
  mime: string;
};

export type VoiceSubmitResponse = {
  submissionUuid: string;
  status: "pending";
};

export const verificationsApi = {
  /**
   * Upload the recorded voice file as multipart/form-data.
   * The backend expects the file under field name "voice".
   */
  async uploadVoice(
    uri: string,
    mimeType: string,
    onProgress?: (percent: number) => void,
  ): Promise<VoiceUploadResponse> {
    const filename = uri.split("/").pop() ?? "recording.m4a";

    const form = new FormData();
    // RN FormData accepts this shape natively
    form.append("voice", {
      uri,
      name: filename,
      type: mimeType,
    } as any);

    const resp = await api.post<ApiSuccess<VoiceUploadResponse>>(
      "/verifications/upload",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      },
    );

    return resp.data.data;
  },

  /**
   * Submit the uploaded voice file metadata for admin review.
   * After this, user's verification_status becomes 'pending'.
   */
  submitVoice(input: {
    voiceUrl: string;
    durationSec: number;
    mime: string;
    sizeBytes: number;
  }) {
    return post<VoiceSubmitResponse>("/verifications/submit", input);
  },
};
