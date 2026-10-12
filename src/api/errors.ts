// src/api/errors.ts
import { messageForErrorCode } from "@/lib/errors";
import { ApiRequestError } from "./client";

export function userMessage(err: unknown): string {
  if (err instanceof ApiRequestError) {
    return messageForErrorCode(err.code);
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

export function isNetworkError(err: unknown): boolean {
  return err instanceof ApiRequestError && err.code === "NETWORK_ERROR";
}
