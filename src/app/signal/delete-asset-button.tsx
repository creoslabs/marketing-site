"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/ws-confirm";
import { useToast } from "@/components/ws-toast";

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
      className="absolute right-[8px] top-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-[6px] text-[12px] opacity-0 transition-opacity group-hover:opacity-100"
      style={{ background: "rgba(0,0,0,.6)", color: "#fff", zIndex: 3 }}
    >
      {pending ? "…" : "✕"}
    </button>
  );
}
