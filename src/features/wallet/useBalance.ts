// src/features/wallet/useBalance.ts
import { walletApi } from "@/api/wallet";
import { useAuthStore } from "@/auth/authStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const walletKeys = {
  balance: ["wallet", "balance"] as const,
  history: (limit: number, offset: number) =>
    ["wallet", "history", limit, offset] as const,
};

export function useBalance() {
  const updateUser = useAuthStore((s) => s.updateUser);

  const query = useQuery({
    queryKey: walletKeys.balance,
    queryFn: () => walletApi.getBalance(),
    staleTime: 60_000,
    // No refetchInterval — socket pushes updates; tab focus also refetches.
  });

  // Sync live balance into the store
  useEffect(() => {
    if (!query.data) return;
    const current = useAuthStore.getState().user;
    if (!current) return;
    if (current.walletBalance === query.data.balance) return;
    updateUser({ walletBalance: query.data.balance });
  }, [query.data, updateUser]);

  return query;
}
