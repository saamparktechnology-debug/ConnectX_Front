// src/lib/format.ts
export function formatMoney(value: string | number, currency = "₹"): string {
  const s = typeof value === "number" ? value.toFixed(2) : value;
  const [whole, frac = "00"] = s.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${currency} ${withCommas}.${frac.padStart(2, "0")}`;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function maskPhone(e164: string): string {
  const m = e164.match(/^(\+\d{2})(\d{2})(\d+)(\d{4})$/);
  if (!m) return e164;
  return `${m[1]} ${m[2]}****${m[4]}`;
}

/**
 * Compact relative time. Handles the MySQL DATETIME(3) string format
 * returned by the backend, e.g. "2026-10-11 13:15:22.078".
 */
export function timeAgo(timestamp: string | null | undefined): string {
  if (!timestamp) return "";

  // MySQL returns 'YYYY-MM-DD HH:MM:SS.mmm' — JS Date needs ISO format
  const normalized = timestamp.includes("T")
    ? timestamp
    : timestamp.replace(" ", "T");

  const then = new Date(normalized).getTime();
  if (!Number.isFinite(then)) return "";

  const now = Date.now();
  const diff = Math.max(0, now - then) / 1000; // seconds

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}
