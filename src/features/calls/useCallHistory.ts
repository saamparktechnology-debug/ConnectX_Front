import {
  callsApi,
  type CallHistoryDirection,
  type CallHistoryResponse,
} from "@/api/calls";
import { useInfiniteQuery } from "@tanstack/react-query";

export const callHistoryKeys = {
  all: ["calls", "history"] as const,
  list: (direction: string, search: string) =>
    [...callHistoryKeys.all, { direction, search }] as const,
};

const PAGE_SIZE = 20;

export function useCallHistory(
  direction: CallHistoryDirection = "all",
  search: string = "",
) {
  return useInfiniteQuery<CallHistoryResponse>({
    queryKey: callHistoryKeys.list(direction, search),
    queryFn: ({ pageParam }) =>
      callsApi.getHistory({
        direction,
        search,
        limit: PAGE_SIZE,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.reduce((sum, p) => sum + p.calls.length, 0);
    },
    staleTime: 15_000,
  });
}
