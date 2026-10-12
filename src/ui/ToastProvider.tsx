// src/ui/ToastProvider.tsx
import { registerToast } from "@/lib/toast";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Toast, type ToastKind, type ToastMessage } from "./Toast";

type ToastContextValue = {
  show: (message: string, kind?: ToastKind) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `toast-${Date.now()}-${idCounter}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<ToastMessage[]>([]);

  const show = useCallback((message: string, kind: ToastKind = "info") => {
    const toast: ToastMessage = { id: nextId(), kind, message };
    setQueue((q) => [...q, toast]);
  }, []);

  // Register with the imperative toast API so non-React code can call showToast()
  useEffect(() => {
    registerToast(show);
    return () => registerToast(() => {});
  }, [show]);

  const dismiss = useCallback((id: string) => {
    setQueue((q) => q.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      <View style={{ flex: 1 }}>{children}</View>
      {queue.map((toast, index) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={dismiss}
          duration={3200 + index * 200}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}
