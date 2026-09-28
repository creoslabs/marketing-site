"use client";

import { useConfirm } from "@/components/ws-confirm";
import { useToast } from "@/components/ws-toast";
import { WsButton } from "@/components/ws-button";

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

export function AddTimezoneButton() {
  const toast = useToast();
  return (
    <button
      type="button"
      onClick={() => toast("Setting a time zone isn't available yet.")}
      className="ws-link-accent whitespace-nowrap text-[11.5px] font-medium"
    >
      Add
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
    <WsButton variant="danger" onClick={handleDelete}>
      Delete account
    </WsButton>
  );
}
