"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ws-toast";
import { analyzeOne } from "../../analyze/analyze-dropzone";

export function ReanalyzeButton({ assetId }: { assetId: string }) {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const { assetId: newAssetId } = await analyzeOne(file, assetId);
      router.push(`/signal/report/${newAssetId}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't analyze that revision.", "error");
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="video/*,image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="ws-btn-ghost rounded-[7px] text-[12.5px] font-medium"
        style={{ padding: "9px 12px", opacity: uploading ? 0.6 : 1 }}
      >
        {uploading ? "Analyzing…" : "Upload revision"}
      </button>
    </>
  );
}
