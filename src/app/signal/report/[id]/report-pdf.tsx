"use client";

import { useState } from "react";
import { useToast } from "@/components/ws-toast";
import { useWsTheme, resolveTheme } from "@/components/ws-theme";
import type { PdfReportData } from "@/lib/signal/report-data";

export type { PdfReportData };

function slugify(name: string) {
  return name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

export function ExportPdfButton({ data }: { data: PdfReportData }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [themePreference] = useWsTheme();

  async function handleExport() {
    setBusy(true);
    try {
      const filename = `${slugify(data.asset.filename)}-signal-report.pdf`;
      const res = await fetch("/api/signal/report-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, theme: resolveTheme(themePreference), filename }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Could not generate the PDF.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't generate the PDF.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={busy}
      className="ws-btn-ghost rounded-[7px] text-[12.5px] font-medium"
      style={{ padding: "8px 12px", opacity: busy ? 0.6 : 1 }}
    >
      {busy ? "Preparing…" : "Export PDF ↓"}
    </button>
  );
}
