"use client";

import type { Post } from "../../data";
import { Button } from "@/components/app/ui";

function escapeCsvCell(value: string | number) {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function downloadPostsCsv(posts: Post[], filename: string) {
  const headers = ["Platform", "Posted", "Views", "Score", "Engagement %", "Caption"];
  const rows = posts.map((p) => [p.platform, p.postedAt, p.views, p.score.toFixed(2), p.engagement.toFixed(1), p.caption.replace(/\n/g, " ")]);
  const csv = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportCsvButton({ posts, filename }: { posts: Post[]; filename: string }) {
  return (
    <Button variant="ghost" size="sm" icon="download" onClick={() => downloadPostsCsv(posts, filename)} disabled={posts.length === 0}>
      Export CSV
    </Button>
  );
}
