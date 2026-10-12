// src/api/wallet.ts
import { get } from "./client";

export type WalletBalance = {
  balance: string;
};

export type WalletTransaction = {
  id: number;
  uuid: string;
  user_id: number;
  type:
    | "recharge"
    | "call_debit"
    | "call_credit"
    | "withdrawal"
    | "withdrawal_refund"
    | "promotion"
    | "admin_adjustment";
  direction: "credit" | "debit";
  amount: string;
  balance_before: string;
  balance_after: string;
  reference_type: string;
  reference_id: number;
  reference_uuid: string | null;
  idempotency_key: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export const walletApi = {
  getBalance() {
    return get<WalletBalance>("/wallet/balance");
  },

  getHistory(limit = 20, offset = 0) {
    return get<WalletTransaction[]>(
      `/wallet/history?limit=${limit}&offset=${offset}`,
    );
  },
};
