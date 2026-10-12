// src/features/wallet/useWalletHistory.ts
import { walletApi } from "@/api/wallet";
import { useQuery } from "@tanstack/react-query";
import { walletKeys } from "./useBalance";

export function useWalletHistory(limit = 20, offset = 0) {
  return useQuery({
    queryKey: walletKeys.history(limit, offset),
    queryFn: () => walletApi.getHistory(limit, offset),
    staleTime: 15_000,
  });
}
