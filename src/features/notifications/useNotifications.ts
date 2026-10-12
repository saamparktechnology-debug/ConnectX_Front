import { notificationsApi, type Notification } from "@/api/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (limit: number) => [...notificationKeys.all, "list", limit] as const,
};

export function useNotifications(limit = 30) {
  return useQuery<{ notifications: Notification[] }>({
    queryKey: notificationKeys.list(limit),
    queryFn: () => notificationsApi.list(limit),
    staleTime: 15_000,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
