// src/features/wallet/useWithdrawalHistory.ts
import {
  withdrawalsApi,
  type WithdrawalHistoryResponse,
} from "@/api/withdrawals";
import { useQuery } from "@tanstack/react-query";

export const withdrawalKeys = {
  all: ["withdrawals", "history"] as const,
  list: (limit: number, offset: number) =>
    [...withdrawalKeys.all, limit, offset] as const,
};

export function useWithdrawalHistory(limit = 20, offset = 0) {
  return useQuery<WithdrawalHistoryResponse>({
    queryKey: withdrawalKeys.list(limit, offset),
    queryFn: () => withdrawalsApi.history(limit, offset),
    staleTime: 15_000,
  });
}
