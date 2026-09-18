"use client";

import { useConfirm } from "@/components/ws-confirm";
import { useToast } from "@/components/ws-toast";

export function ConnectButton({ label = "Connect" }: { label?: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast("Connecting accounts isn't available yet.")}
      className="ws-link-accent whitespace-nowrap text-[11.5px] font-medium"
    >
      {label}
    </button>
  );
}

export function DeleteAccountButton() {
  const confirm = useConfirm();
  const toast = useToast();

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Delete your Creos Labs account?",
      description: "This removes access to Outlier and Signal and can't be undone.",
      confirmLabel: "Delete account",
      danger: true,
    });
    if (confirmed) {
      toast("Account deletion isn't available yet.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="rounded-[8px] text-[12.5px] font-medium"
      style={{
        padding: "10px 14px",
        background: "transparent",
        color: "var(--ws-warn-text)",
        border: "1px solid var(--ws-hairline-strong)",
      }}
    >
      Delete account
    </button>
  );
}
