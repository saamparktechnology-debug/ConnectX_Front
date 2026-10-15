import { targetsApi, type FemaleTarget } from "@/api/targets";
import { useQuery } from "@tanstack/react-query";

export function useTarget() {
  return useQuery<FemaleTarget>({
    queryKey: ["target", "me"],
    queryFn: () => targetsApi.getMine(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
