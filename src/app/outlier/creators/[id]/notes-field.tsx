"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ws-toast";

export function NotesField({ creatorId, initialNotes }: { creatorId: string; initialNotes: string | null }) {
  const router = useRouter();
  const toast = useToast();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = notes !== (initialNotes ?? "");

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/outlier/creators/${creatorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSaving(false);
    if (res.ok) {
      toast("Note saved.", "success");
      router.refresh();
    } else {
      toast("Couldn't save that note.", "error");
    }
  }

  return (
    <div className="ws-card mt-[14px]" style={{ padding: "16px 18px" }}>
      <p className="ws-eyebrow">WHY I&apos;M TRACKING THEM</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add a personal note — never shown to anyone but you."
        rows={2}
        className="mt-[8px] w-full text-[12.5px] outline-none"
        style={{
          padding: "9px 12px",
          borderRadius: 7,
          border: "1px solid var(--ws-hairline)",
          background: "var(--ws-surface-header)",
          color: "var(--ws-ink)",
          resize: "vertical",
        }}
      />
      {dirty && (
        <div className="mt-[8px] flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="ws-btn-primary rounded-[7px] text-[12px] font-semibold"
            style={{ padding: "7px 12px", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? "Saving…" : "Save note"}
          </button>
        </div>
      )}
    </div>
  );
}
