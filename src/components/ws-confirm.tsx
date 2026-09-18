"use client";

import { createContext, useCallback, useContext, useState } from "react";

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
          style={{ zIndex: 200, background: "rgba(0,0,0,.5)" }}
          onClick={() => settle(false)}
        >
          <div
            className="ws-card ws-modal-in"
            style={{ width: 380, padding: "22px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[15px] font-semibold" style={{ color: "var(--ws-ink)" }}>
              {pending.title}
            </p>
            {pending.description && (
              <p className="mt-[8px] text-[12.5px] leading-[1.5]" style={{ color: "var(--ws-ink-60)" }}>
                {pending.description}
              </p>
            )}
            <div className="mt-[18px] flex justify-end gap-[8px]">
              <button
                type="button"
                onClick={() => settle(false)}
                className="ws-btn-ghost rounded-[7px] text-[12.5px] font-medium"
                style={{ padding: "9px 14px" }}
              >
                {pending.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                className={pending.danger ? "rounded-[7px] text-[12.5px] font-semibold" : "ws-btn-primary rounded-[7px] text-[12.5px] font-semibold"}
                style={
                  pending.danger
                    ? { padding: "9px 14px", background: "var(--ws-warn)", color: "var(--ws-warn-ink)" }
                    : { padding: "9px 14px" }
                }
              >
                {pending.confirmLabel ?? "Confirm"}
              </button>
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
