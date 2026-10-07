import type { Metadata } from "next";
import { AnalyzeDropzone } from "./analyze-dropzone";
import { AppMain, PageHeader } from "@/components/app/ui";

export const metadata: Metadata = {
  title: "Analyze — Signal",
  robots: { index: false, follow: false },
};

export default function AnalyzePage() {
  return (
    <AppMain>
      <div style={{ maxWidth: 860, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
        <PageHeader eyebrow="01 / Analyse" line1="Analyse new creative." sub="Format is detected on upload — the right criteria set is applied automatically." />
        <AnalyzeDropzone />
      </div>
    </AppMain>
  );
}
