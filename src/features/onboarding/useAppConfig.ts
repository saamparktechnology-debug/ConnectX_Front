import { configApi, type AppConfig } from "@/api/config";
import { useQuery } from "@tanstack/react-query";

export function useAppConfig() {
  return useQuery<AppConfig>({
    queryKey: ["app-config"],
    queryFn: () => configApi.get(),
    staleTime: 5 * 60_000,
  });
}
