// src/lib/errors.ts
export const ERROR_MESSAGES: Record<string, string> = {
  OTP_EXPIRED_OR_INVALID: "Your OTP has expired. Please request a new one.",
  INVALID_OTP: "The OTP you entered is incorrect.",
  TOO_MANY_ATTEMPTS: "Too many attempts. Please request a new OTP.",
  PROFILE_REQUIRED: "This number is new — please complete registration.",
  ACCOUNT_BLOCKED: "Your account has been suspended. Please contact support.",
  TOKEN_REUSE_DETECTED: "Session expired for security. Please log in again.",
  INVALID_REFRESH_TOKEN: "Your session has expired. Please log in again.",
  REFRESH_EXPIRED: "Your session has expired. Please log in again.",
  USER_INACTIVE: "Your account is unavailable. Please contact support.",
  INSUFFICIENT_BALANCE:
    "You need at least ₹3 to place a call. Please recharge.",
  RECEIVER_OFFLINE: "This companion is offline right now.",
  RECEIVER_BUSY: "This companion is on another call.",
  RECEIVER_UNVERIFIED: "This profile is not yet verified.",
  RECEIVER_INACTIVE: "This companion is currently unavailable.",
  SELF_CALL_PROHIBITED: "You cannot call your own account.",
  CALLER_INACTIVE: "Your account is unavailable. Please contact support.",
  SESSION_NOT_FOUND: "This call is no longer available.",
  CALL_NOT_RINGING: "This call can no longer be accepted or rejected.",
  CALL_NOT_ACCEPTED: "Room tokens are issued only after a call is accepted.",
  INVALID_RECHARGE_LIMITS: "Enter an amount between ₹10 and ₹50,000.",
  MINIMUM_WITHDRAWAL_LIMIT: "Minimum withdrawal is ₹100.",
  INSUFFICIENT_FUNDS: "Not enough balance for this withdrawal.",
  COMPANION_ONLY: "Only companion accounts can withdraw.",
  INVALID_AMOUNT: "Enter a valid amount.",
  INVALID_VOICE_DURATION: "Recording must be between 5 and 120 seconds.",
  INVALID_FILE_TYPE: "That file type is not supported.",
  NO_FILE: "No recording was submitted. Please try again.",
  VERIFICATION_REQUIRED: "Complete verification before going online.",
  ACCOUNT_NOT_ACTIVE: "Your account is not active.",
  FORBIDDEN: "You do not have permission to do that.",
  ALREADY_RATED: "You have already rated this call.",
  CALL_NOT_FOUND: "Call record not found.",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please slow down.",
  VALIDATION_ERROR: "Please check the form and try again.",
  UNAUTHORIZED: "Please log in again.",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again.",
};

const FALLBACK = "Something went wrong. Please try again.";

export function messageForErrorCode(code?: string): string {
  if (!code) return FALLBACK;
  return ERROR_MESSAGES[code] ?? FALLBACK;
}
