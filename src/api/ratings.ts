// src/api/ratings.ts
import { get, post } from "./client";

export type PendingRating = {
  callId: number;
  companionName: string;
} | null;

export type SubmitRatingResponse = {
  ratingId: number;
  isFlagged: boolean;
};

export const ratingsApi = {
  getPending() {
    return get<PendingRating>("/ratings/pending");
  },

  submit(callId: number, rating: number, review?: string) {
    return post<SubmitRatingResponse>("/ratings/submit", {
      callId,
      rating,
      review,
    });
  },
};
