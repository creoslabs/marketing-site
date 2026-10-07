"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Button } from "@/components/app/ui";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void };

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<Confirm>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  function settle(result: boolean) {
    pending?.resolve(result);
    setPending(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          className="ws-overlay-in fixed inset-0 flex items-center justify-center px-6"
          style={{ zIndex: 200, background: "rgba(0,0,0,.6)" }}
          onClick={() => settle(false)}
        >
          <div
            className="ws-card ws-modal-in"
            style={{ width: 400, maxWidth: "100%", padding: "26px", boxShadow: "0 30px 80px rgba(0,0,0,.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[18px] font-bold" style={{ color: "var(--ws-ink)" }}>
              {pending.title}
            </p>
            {pending.description && (
              <p className="mt-[8px] text-[14px] leading-[1.5]" style={{ color: "var(--ws-ink-60)" }}>
                {pending.description}
              </p>
            )}
            <div className="mt-[20px] flex justify-end gap-[10px]">
              <Button variant="ghost" onClick={() => settle(false)}>
                {pending.cancelLabel ?? "Cancel"}
              </Button>
              <Button variant={pending.danger ? "danger" : "primary"} onClick={() => settle(true)}>
                {pending.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

// Promise-based replacement for window.confirm() — await confirm({...})
// resolves true/false instead of blocking the thread with a native dialog.
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}
