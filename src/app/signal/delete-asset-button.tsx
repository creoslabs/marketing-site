"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/ws-confirm";
import { useToast } from "@/components/ws-toast";
import { Icon } from "@/components/app/icons";
import { appStyles as s } from "@/components/app/ui";

// Hover-revealed, and always behind a confirm — deleting is one step removed.
export function DeleteAssetButton({ assetId, filename }: { assetId: string; filename: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = await confirm({
      title: `Delete "${filename}"?`,
      description: "This removes the analysis and the stored preview. This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) return;

    startTransition(async () => {
      const res = await fetch(`/api/signal/assets/${assetId}`, { method: "DELETE" });
      if (res.ok) {
        toast(`Deleted "${filename}".`, "success");
        router.refresh();
      } else {
        const body = await res.json().catch(() => null);
        toast(body?.error ?? "Couldn't delete that asset.", "error");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      aria-label={`Delete ${filename}`}
      className={s.assetDelete}
    >
      <Icon name="close" size={13} />
    </button>
  );
}
