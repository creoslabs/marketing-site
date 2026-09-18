"use client";

import { useState } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { Asset, Criterion, StaticFinding, VideoFinding } from "../../data";

export type PdfReportData = {
  asset: Asset;
  criteria: Criterion[];
  findings: VideoFinding[] | StaticFinding[];
  topFix: { title: string; clears: number; body: string };
  median: number;
  percentile: number | null;
};

const VERDICT_COLOR: Record<Criterion["verdict"], string> = {
  pass: "#1a7f4e",
  partial: "#a3690a",
  fail: "#b3261e",
};

function isVideoFinding(f: VideoFinding | StaticFinding): f is VideoFinding {
  return "t" in f;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function slugify(name: string) {
  return name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

// react-pdf is a real vector PDF renderer (not a screenshot tool), but its
// bundle is sizeable — both it and this document are loaded dynamically on
// click so neither weighs down the report page itself.
async function buildDocument(data: PdfReportData) {
  const { Document, Page, View, Text, StyleSheet } = await import("@react-pdf/renderer");

  const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
    eyebrow: { fontSize: 8, fontWeight: 700, letterSpacing: 1.2, color: "#6b6b6b", textTransform: "uppercase" },
    title: { fontSize: 20, fontWeight: 700, marginTop: 6 },
    metaRow: { flexDirection: "row", gap: 10, marginTop: 8, fontSize: 9.5, color: "#4a4a4a" },
    divider: { borderBottomWidth: 1, borderBottomColor: "#e2e2e2", marginVertical: 18 },
    scoreRow: { flexDirection: "row", alignItems: "flex-end", gap: 16 },
    scoreValue: { fontSize: 46, fontWeight: 700 },
    scoreMetaTitle: { fontSize: 12, fontWeight: 600, marginBottom: 6 },
    scoreMetaSub: { fontSize: 9.5, color: "#6b6b6b" },
    sectionTitle: {
      fontSize: 8,
      fontWeight: 700,
      letterSpacing: 1.2,
      color: "#6b6b6b",
      textTransform: "uppercase",
      marginBottom: 8,
      marginTop: 20,
    },
    criteriaRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
    criteriaHead: { flexDirection: "row", justifyContent: "space-between" },
    criteriaVerdict: { fontSize: 9.5, fontWeight: 700, textTransform: "capitalize" },
    criteriaName: { fontSize: 10.5, fontWeight: 600 },
    criteriaEvidence: { fontSize: 9.5, color: "#5a5a5a", marginTop: 3, lineHeight: 1.4 },
    findingCard: { padding: 10, marginBottom: 8, backgroundColor: "#f7f7f7", borderRadius: 4 },
    findingHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    findingTag: {
      fontSize: 8.5,
      fontWeight: 700,
      color: "#fff",
      backgroundColor: "#1a1a1a",
      paddingVertical: 2,
      paddingHorizontal: 5,
      borderRadius: 3,
    },
    findingCriterion: { fontSize: 10, fontWeight: 600 },
    findingTier: { fontSize: 8.5, color: "#9a9a9a", marginLeft: "auto" },
    findingBody: { fontSize: 9.5, color: "#4a4a4a", marginTop: 5, lineHeight: 1.4 },
    topFix: { marginTop: 16, padding: 14, backgroundColor: "#eef3ff", borderRadius: 6 },
    topFixTitle: { fontSize: 8, fontWeight: 700, letterSpacing: 1, color: "#2451c9", textTransform: "uppercase" },
    topFixHeading: { fontSize: 11, fontWeight: 700, marginTop: 6 },
    topFixBody: { fontSize: 9.5, color: "#33456e", marginTop: 5, lineHeight: 1.4 },
    footer: {
      position: "absolute",
      bottom: 24,
      left: 40,
      right: 40,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 8,
      color: "#9a9a9a",
    },
  });

  const { asset, criteria, findings, topFix, median, percentile } = data;
  const tier1 = criteria.filter((c) => c.tier === 1);
  const tier2 = criteria.filter((c) => c.tier === 2);
  const counts = {
    pass: criteria.filter((c) => c.verdict === "pass").length,
    partial: criteria.filter((c) => c.verdict === "partial").length,
    fail: criteria.filter((c) => c.verdict === "fail").length,
  };
  const criteriaCount = asset.format === "video" ? 16 : 7;

  function CriteriaSection(title: string, list: Criterion[]) {
    if (list.length === 0) return null;
    return (
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {list.map((c) => (
          <View key={c.name} style={styles.criteriaRow}>
            <View style={styles.criteriaHead}>
              <Text style={styles.criteriaName}>{c.name}</Text>
              <Text style={[styles.criteriaVerdict, { color: VERDICT_COLOR[c.verdict] }]}>{c.verdict}</Text>
            </View>
            <Text style={styles.criteriaEvidence}>{c.evidence}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Signal — Best-Practice Report</Text>
        <Text style={styles.title}>{asset.filename}</Text>
        <View style={styles.metaRow}>
          <Text>{asset.platform}</Text>
          <Text>·</Text>
          <Text>{asset.format === "video" ? `Video · ${asset.duration ?? ""} · 9:16` : "Static · 4:5"}</Text>
          <Text>·</Text>
          <Text>{asset.postedAt}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>{Math.round(asset.score)}</Text>
          <View>
            <Text style={styles.scoreMetaTitle}>
              {counts.pass} pass · {counts.partial} partial · {counts.fail} fail
            </Text>
            <Text style={styles.scoreMetaSub}>
              {percentile === null
                ? `First ${asset.format} analyzed in this set — not comparable across formats.`
                : `${percentile}th percentile among ${asset.format === "video" ? "videos" : "statics"} in this set · median ${median}`}
            </Text>
            <Text style={[styles.scoreMetaSub, { marginTop: 2 }]}>{criteriaCount} best-practice criteria checked</Text>
          </View>
        </View>

        {CriteriaSection("Tier 1 · Structural", tier1)}
        {CriteriaSection("Tier 2 · Contextual", tier2)}

        <Text style={styles.sectionTitle}>{asset.format === "video" ? "Findings · Timestamped" : "Findings · Spatial"}</Text>
        {findings.map((f) => (
          <View key={f.id} style={styles.findingCard}>
            <View style={styles.findingHead}>
              <Text style={styles.findingTag}>{isVideoFinding(f) ? formatTime(f.t) : f.marker.toUpperCase()}</Text>
              <Text style={styles.findingCriterion}>{f.criterion}</Text>
              <Text style={styles.findingTier}>TIER {f.tier}</Text>
            </View>
            <Text style={styles.findingBody}>{f.body}</Text>
          </View>
        ))}

        <View style={styles.topFix}>
          <Text style={styles.topFixTitle}>
            Top fix · clears {topFix.clears} check{topFix.clears === 1 ? "" : "s"}
          </Text>
          <Text style={styles.topFixHeading}>{topFix.title}</Text>
          <Text style={styles.topFixBody}>{topFix.body}</Text>
        </View>

        <View style={styles.footer} fixed>
          <Text>Creos Labs · Signal</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export function ExportPdfButton({ data }: { data: PdfReportData }) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      const [{ pdf }, doc] = await Promise.all([import("@react-pdf/renderer"), buildDocument(data)]);
      const blob = await pdf(doc as React.ReactElement<DocumentProps>).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(data.asset.filename)}-signal-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
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
