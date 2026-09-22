"use client";

import { useState } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { useToast } from "@/components/ws-toast";
import type { Asset, Criterion, StaticFinding, VideoFinding } from "../../data";

export type PdfReportData = {
  asset: Asset;
  criteria: Criterion[];
  findings: VideoFinding[] | StaticFinding[];
  topFix: { title: string; clears: number; body: string };
  median: number;
  percentile: number | null;
  thumbnailUrl?: string | null;
};

// The light-mode palette from globals.css — a PDF sent to a designer should
// read as a print-ready document, not a screenshot of the dark dashboard, so
// this mirrors the report page's actual tokens rather than the dark theme.
const COLOR = {
  ground: "#faf9f7",
  surface: "#ffffff",
  surfaceHeader: "#f7f6f3",
  ink: "#111111",
  ink60: "rgba(0,0,0,0.6)",
  ink45: "rgba(0,0,0,0.45)",
  hairline: "#e4e2dd",
  accent: "#0a6cf0",
  accentInk: "#ffffff",
  accentText: "#0a6cf0",
  accentTint: "#e8f1ff",
  accentTintBorder: "rgba(10,108,240,0.3)",
  accentTintInk: "#0b2a52",
  warn: "#d14424",
  warnInk: "#ffffff",
  warnTint: "#ffeee9",
};

// Matches VerdictLabel in ../../components.tsx: pass reads as accent blue,
// fail as warn orange, partial as neutral gray — not a traffic-light scheme.
const VERDICT_COLOR: Record<Criterion["verdict"], string> = {
  pass: COLOR.accentText,
  partial: COLOR.ink60,
  fail: COLOR.warn,
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
  const { Document, Page, View, Text, Image, StyleSheet } = await import("@react-pdf/renderer");

  const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: COLOR.ink, backgroundColor: COLOR.ground },
    topBar: { height: 4, backgroundColor: COLOR.accent, marginHorizontal: -32, marginTop: -32, marginBottom: 24 },
    headerRow: { flexDirection: "row", gap: 16 },
    thumb: { width: 90, height: 120, borderRadius: 8, objectFit: "cover", backgroundColor: COLOR.surfaceHeader },
    eyebrow: { fontSize: 8, fontWeight: 700, letterSpacing: 1.2, color: COLOR.ink45, textTransform: "uppercase" },
    title: { fontSize: 19, fontWeight: 700, marginTop: 5 },
    metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, fontSize: 9.5, color: COLOR.ink60, alignItems: "center" },
    formatBadge: {
      fontSize: 8.5,
      fontWeight: 700,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: COLOR.accentInk,
      backgroundColor: COLOR.ink,
      paddingVertical: 3,
      paddingHorizontal: 6,
      borderRadius: 4,
    },
    card: {
      backgroundColor: COLOR.surface,
      borderWidth: 1,
      borderColor: COLOR.hairline,
      borderRadius: 10,
      padding: 18,
      marginTop: 20,
    },
    scoreRow: { flexDirection: "row", alignItems: "flex-end", gap: 18 },
    scoreValue: { fontSize: 44, fontWeight: 700, letterSpacing: -1 },
    scoreMetaTitle: { fontSize: 12, fontWeight: 700, marginBottom: 5 },
    scoreMetaSub: { fontSize: 9.5, color: COLOR.ink45 },
    barTrack: { height: 6, borderRadius: 3, backgroundColor: COLOR.surfaceHeader, marginTop: 16, position: "relative" },
    barFill: { position: "absolute", top: 0, left: 0, bottom: 0, borderRadius: 3, backgroundColor: COLOR.ink },
    barMedian: { position: "absolute", top: -2, bottom: -2, width: 2, backgroundColor: COLOR.ink },
    barLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 6, fontSize: 8.5, color: COLOR.ink45 },
    sectionTitle: { fontSize: 8, fontWeight: 700, letterSpacing: 1.2, color: COLOR.ink45, textTransform: "uppercase", marginBottom: 4 },
    criteriaRow: { paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLOR.hairline },
    criteriaHead: { flexDirection: "row", justifyContent: "space-between" },
    criteriaVerdict: { fontSize: 9.5, fontWeight: 700, textTransform: "capitalize" },
    criteriaName: { fontSize: 10.5, fontWeight: 600 },
    criteriaEvidence: { fontSize: 9.5, color: COLOR.ink45, marginTop: 3, lineHeight: 1.4 },
    findingCard: {
      padding: 11,
      marginTop: 9,
      backgroundColor: COLOR.surface,
      borderWidth: 1,
      borderColor: COLOR.hairline,
      borderRadius: 8,
    },
    findingHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    findingTag: { fontSize: 8.5, fontWeight: 700, paddingVertical: 2.5, paddingHorizontal: 6, borderRadius: 3 },
    findingCriterion: { fontSize: 10, fontWeight: 700 },
    findingTier: { fontSize: 8, fontWeight: 700, letterSpacing: 0.5, color: COLOR.ink45, marginLeft: "auto" },
    findingBody: { fontSize: 9.5, color: COLOR.ink60, marginTop: 5, lineHeight: 1.4 },
    topFix: {
      marginTop: 20,
      padding: 16,
      backgroundColor: COLOR.accentTint,
      borderWidth: 1,
      borderColor: COLOR.accentTintBorder,
      borderRadius: 10,
    },
    topFixTitle: { fontSize: 8, fontWeight: 700, letterSpacing: 1, color: COLOR.accentText, textTransform: "uppercase" },
    topFixHeading: { fontSize: 12, fontWeight: 700, marginTop: 7, color: COLOR.accentTintInk },
    topFixBody: { fontSize: 9.5, color: COLOR.accentTintInk, marginTop: 5, lineHeight: 1.4 },
    footer: {
      position: "absolute",
      bottom: 22,
      left: 32,
      right: 32,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 8,
      color: COLOR.ink45,
    },
  });

  const { asset, criteria, findings, topFix, median, percentile, thumbnailUrl } = data;
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
      <View style={{ marginTop: 18 }}>
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
        <View style={styles.topBar} fixed />

        <View style={styles.headerRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image is a PDF drawing primitive, not an HTML <img>; it has no alt prop */}
          {thumbnailUrl && <Image src={thumbnailUrl} style={styles.thumb} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>Signal — Best-Practice Report</Text>
            <Text style={styles.title}>{asset.filename}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.formatBadge}>
                {asset.format === "video" ? `VIDEO · ${asset.duration ?? ""} · 9:16` : "STATIC · 4:5"}
              </Text>
              <Text>{asset.platforms.join(" + ")}</Text>
              <Text>·</Text>
              <Text>{asset.postedAt}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>{Math.round(asset.score)}</Text>
            <View style={{ paddingBottom: 4 }}>
              <Text style={styles.scoreMetaTitle}>
                {counts.pass} pass · {counts.partial} partial · {counts.fail} fail
              </Text>
              <Text style={styles.scoreMetaSub}>
                {percentile === null
                  ? `First ${asset.format} analyzed in this set — not comparable across formats.`
                  : `${percentile}th percentile among ${asset.format === "video" ? "videos" : "statics"} in this set`}
              </Text>
              <Text style={[styles.scoreMetaSub, { marginTop: 2 }]}>{criteriaCount} best-practice criteria checked</Text>
            </View>
          </View>

          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.min(100, asset.score)}%` }]} />
            <View style={[styles.barMedian, { left: `${Math.min(100, median)}%` }]} />
          </View>
          <View style={styles.barLabels}>
            <Text>0</Text>
            <Text>median {median}</Text>
            <Text>100</Text>
          </View>
        </View>

        <View style={styles.card}>
          {CriteriaSection("Tier 1 · Structural", tier1)}
          {CriteriaSection("Tier 2 · Contextual", tier2)}
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>{asset.format === "video" ? "Findings · Timestamped" : "Findings · Spatial"}</Text>
          {findings.map((f) => (
            <View key={f.id} style={styles.findingCard}>
              <View style={styles.findingHead}>
                <Text
                  style={[
                    styles.findingTag,
                    isVideoFinding(f) && f.failure
                      ? { backgroundColor: COLOR.warn, color: COLOR.warnInk }
                      : { backgroundColor: COLOR.surfaceHeader, color: COLOR.ink60 },
                  ]}
                >
                  {isVideoFinding(f) ? formatTime(f.t) : f.marker.toUpperCase()}
                </Text>
                <Text style={styles.findingCriterion}>{f.criterion}</Text>
                <Text style={styles.findingTier}>TIER {f.tier}</Text>
              </View>
              <Text style={styles.findingBody}>{f.body}</Text>
            </View>
          ))}
        </View>

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
  const toast = useToast();
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
    } catch {
      toast("Couldn't generate the PDF.", "error");
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
