import { get } from "./client";

export type FemaleTarget = {
  id: number;
  userId: number;
  periodYear: number;
  periodMonth: number;
  targetMinutes: number;
  prizeAmount: string;
  notes: string | null;
  achievedMinutes: number;
  isComplete: boolean;
  progressPercent: number;
  awarded: { awardedAt: string; prizeAmount: string } | null;
} | null;

export const targetsApi = {
  getMine(year?: number, month?: number) {
    const qs = new URLSearchParams();
    if (year) qs.set("year", String(year));
    if (month) qs.set("month", String(month));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return get<FemaleTarget>(`/users/me/target${suffix}`);
  },
};
