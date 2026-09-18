"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastVariant = "info" | "success" | "error";
type Toast = { id: number; message: string; variant: ToastVariant };

type ShowToast = (message: string, variant?: ToastVariant) => void;

const ToastContext = createContext<ShowToast | null>(null);

const VARIANT_BORDER: Record<ToastVariant, string> = {
  info: "var(--ws-hairline-strong)",
  success: "var(--ws-accent)",
  error: "var(--ws-warn)",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback<ShowToast>((message, variant = "info") => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        className="fixed bottom-[18px] right-[18px] flex flex-col gap-[8px]"
        style={{ zIndex: 300, pointerEvents: "none" }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="ws-card ws-toast-in"
            style={{
              pointerEvents: "auto",
              padding: "12px 16px",
              width: 300,
              borderLeft: `3px solid ${VARIANT_BORDER[t.variant]}`,
            }}
          >
            <p className="text-[12.5px] font-medium leading-[1.4]" style={{ color: "var(--ws-ink)" }}>
              {t.message}
            </p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Returns a function you call directly — toast("message") or
// toast("message", "error"). Kept to a single call shape rather than
// toast.success()/toast.error() so call sites don't need extra imports.
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
