"use client";

import type { Post } from "../../data";

function escapeCsvCell(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function ExportCsvButton({ posts, filename }: { posts: Post[]; filename: string }) {
  function handleExport() {
    const headers = ["Platform", "Posted", "Views", "Score", "Engagement %", "Caption"];
    const rows = posts.map((p) => [
      p.platform,
      p.postedAt,
      p.views,
      p.score.toFixed(2),
      p.engagement.toFixed(1),
      p.caption.replace(/\n/g, " "),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={posts.length === 0}
      className="ws-btn-ghost shrink-0 rounded-[8px] text-[12px] font-medium"
      style={{ padding: "8px 12px", opacity: posts.length === 0 ? 0.5 : 1 }}
    >
      Export CSV
    </button>
  );
}
