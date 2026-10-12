// src/api/withdrawals.ts
import { get, post } from "./client";

export type WithdrawalRequestResponse = {
  withdrawalUuid: string;
  requestedAmount: number;
  taxAmount: number;
  netAmount: number;
  status: "pending";
};

export type WithdrawalStatus = "pending" | "paid" | "rejected" | "failed";

export type WithdrawalHistoryRow = {
  id: number;
  uuid: string;
  requestedAmount: string;
  taxAmount: string;
  netAmount: string;
  payoutMethod: string;
  payoutUpiId: string;
  status: WithdrawalStatus;
  processedAt: string | null;
  adminNote: string | null;
  createdAt: string;
};

export type WithdrawalHistoryResponse = {
  withdrawals: WithdrawalHistoryRow[];
  total: number;
};

export const withdrawalsApi = {
  request(amount: number, upiId: string, idempotencyKey: string) {
    return post<WithdrawalRequestResponse>(
      "/withdrawals/request",
      { amount, upiId, idempotencyKey },
      { headers: { "x-idempotency-key": idempotencyKey } },
    );
  },

  history(limit = 20, offset = 0) {
    return get<WithdrawalHistoryResponse>(
      `/withdrawals/history?limit=${limit}&offset=${offset}`,
    );
  },
};
