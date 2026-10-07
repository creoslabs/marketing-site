"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ws-toast";
import { Button, Card, CardHead, appStyles as s } from "@/components/app/ui";

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
    <Card style={{ padding: 20 }}>
      <CardHead label="Why I’m tracking them" />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add a personal note — never shown to anyone but you."
        rows={2}
        className={s.input}
        style={{ width: "100%" }}
        aria-label="Why I'm tracking them"
      />
      {dirty && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" size="sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save note"}
          </Button>
        </div>
      )}
    </Card>
  );
}
