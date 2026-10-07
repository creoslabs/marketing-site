"use client";

import { useConfirm } from "@/components/ws-confirm";
import { useToast } from "@/components/ws-toast";
import { Button } from "@/components/app/ui";

export function AddTimezoneButton() {
  const toast = useToast();
  return (
    <Button variant="link" onClick={() => toast("Setting a time zone isn't available yet.")}>
      Set time zone
    </Button>
  );
}

export function AvatarUploadButton() {
  const toast = useToast();
  return (
    <Button variant="link" onClick={() => toast("Avatar upload isn't available yet.")}>
      Upload
    </Button>
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
    <Button variant="danger" onClick={handleDelete}>
      Delete account
    </Button>
  );
}
