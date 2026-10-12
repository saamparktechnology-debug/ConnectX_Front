import { usersApi } from "@/api/users";
import { useQuery } from "@tanstack/react-query";

export const discoveryKeys = {
  all: ["discovery"] as const,
  list: (search: string, language: string, category: string) =>
    [...discoveryKeys.all, "list", { search, language, category }] as const,
};

export function useDiscovery(
  search: string = "",
  language: string = "",
  category: string = "all",
) {
  return useQuery({
    queryKey: discoveryKeys.list(search, language, category),
    queryFn: () =>
      usersApi.searchFemales({
        search,
        language,
        category,
        limit: 30,
        offset: 0,
      }),
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}
