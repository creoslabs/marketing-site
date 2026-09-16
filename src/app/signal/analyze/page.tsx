import type { Metadata } from "next";
import { AnalyzeDropzone } from "./analyze-dropzone";

export const metadata: Metadata = {
  title: "Analyze — Signal",
  robots: { index: false, follow: false },
};

export default function AnalyzePage() {
  return (
    <div className="ws-page-in" style={{ padding: "26px 22px" }}>
      <h1 className="text-center text-[22px] font-bold tracking-[-0.02em]" style={{ color: "var(--ws-ink)" }}>
        Analyze a new asset
      </h1>
      <p className="mx-auto mt-2 max-w-[420px] text-center text-[13px]" style={{ color: "var(--ws-ink-60)" }}>
        Format is detected on upload — the right criteria set is applied automatically.
      </p>

      <div className="mt-[36px]">
        <AnalyzeDropzone />
      </div>
    </div>
  );
}
