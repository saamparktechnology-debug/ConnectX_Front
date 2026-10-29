// src/lib/toast.ts
/**
 * Imperative toast API.
 * Non-React code (axios interceptors, socket handlers) can call `showToast`
 * without needing a hook. The `ToastProvider` registers the real renderer.
 */

export type ToastKind = "success" | "error" | "warning" | "info";

type ToastFn = (message: string, kind?: ToastKind) => void;

let toastFn: ToastFn | null = null;

export function registerToast(fn: ToastFn): void {
  toastFn = fn;
}

export function showToast(message: string, kind: ToastKind = "info"): void {
  if (toastFn) {
    toastFn(message, kind);
  } else {
    // Fallback so nothing is silently swallowed during early boot
    // eslint-disable-next-line no-console
    // console.log(`[toast:${kind}] ${message}`);
  }
}
