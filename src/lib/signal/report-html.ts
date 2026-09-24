// Ported line-for-line from signal-report-template/signal_report.html.j2 —
// same markup, same inline styles, Jinja2 macros as TS functions. Keep this
// in sync with that file if the design changes; don't drift the two apart.
import type { ReportData, ReportPanel, ReportCriterionRow, ReportTimelineMark, ReportFinding } from "./report-data";
import type { ReportTheme } from "./report-theme";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusPill(status: "pass" | "partial" | "fail", theme: ReportTheme): string {
  if (status === "pass") {
    return `<span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px 4px 9px; border-radius: 9999px; background: ${theme.pass_bg}; border: 1px solid ${theme.pass_border}; color: ${theme.accent_ink}; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${theme.accent_ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>Pass</span>`;
  }
  if (status === "partial") {
    return `<span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px 4px 9px; border-radius: 9999px; background: ${theme.partial_bg}; border: 1px solid ${theme.partial_border}; color: ${theme.warn_ink}; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${theme.warn_ink}" stroke-width="3.5" stroke-linecap="round"><path d="M12 8v5"></path><circle cx="12" cy="16.2" r="0.4" fill="${theme.warn_ink}" stroke="none"></circle></svg>Partial</span>`;
  }
  return `<span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px 4px 9px; border-radius: 9999px; background: ${theme.fail_bg}; border: 1px solid ${theme.fail_border}; color: ${theme.danger_ink}; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="${theme.danger_ink}" stroke-width="3.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>Fail</span>`;
}

function frameMapPanel(panel: ReportPanel, theme: ReportTheme): string {
  const frames = panel.frames
    .map((frame) => {
      const bands = frame.bands
        .map((band) => {
          if (band.tone === "hatch") {
            return `<div style="position: absolute; left: 0; right: 0; top: ${band.top}%; height: ${band.height}%; background: repeating-linear-gradient(45deg, ${theme.hatch_strong} 0px, ${theme.hatch_strong} 4px, ${theme.hatch_soft} 4px, ${theme.hatch_soft} 8px); display: flex; align-items: center; justify-content: center;"><span style="font-size: 7px; font-weight: 700; color: ${theme.danger_tint_text};">${escapeHtml(band.label)}</span></div>`;
          }
          if (band.tone === "danger") {
            const bg = band.strong ? theme.danger_tint_bg_strong : theme.danger_tint_bg;
            const border = band.bordered
              ? `border-top: 1px dashed ${theme.danger_tint_border_dashed}; border-bottom: 1px dashed ${theme.danger_tint_border_dashed};`
              : "";
            return `<div style="position: absolute; left: 0; right: 0; top: ${band.top}%; height: ${band.height}%; background: ${bg}; ${border} display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 4px;"><span style="font-size: 8px; font-weight: 700; color: ${theme.danger_tint_text}; text-align: center; line-height: 1.2;">${escapeHtml(band.label)}</span></div>`;
          }
          const border = band.bordered ? `border-bottom: 1px dashed ${theme.info_tint_border_dashed};` : "";
          return `<div style="position: absolute; left: 0; right: 0; top: ${band.top}%; height: ${band.height}%; background: ${theme.info_tint_bg}; ${border} display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 4px;"><span style="font-size: 8px; font-weight: 700; color: ${theme.info_tint_text}; text-align: center; line-height: 1.2;">${escapeHtml(band.label)}</span></div>`;
        })
        .join("");
      return `<div style="display: flex; flex-direction: column; gap: 8px; align-items: center;"><div style="position: relative; width: 104px; height: 185px; border-radius: 8px; border: 1px solid ${theme.frame_border}; background: ${theme.frame_bg}; overflow: hidden; flex-shrink: 0; box-shadow: ${theme.frame_shadow}; box-sizing: border-box;">${bands}</div><span style="font-size: 11px; font-weight: 700; color: ${theme.ink}; font-variant-numeric: tabular-nums;">${escapeHtml(frame.timestamp)}</span></div>`;
    })
    .join("");

  const legend = panel.legend
    .map((item) => {
      const swatch =
        item.tone === "hatch"
          ? `<span style="width: 10px; height: 10px; border-radius: 2px; background: repeating-linear-gradient(45deg, ${theme.legend_hatch_strong} 0px, ${theme.legend_hatch_strong} 2px, ${theme.legend_hatch_soft} 2px, ${theme.legend_hatch_soft} 4px); flex-shrink: 0;"></span>`
          : `<span style="width: 10px; height: 10px; border-radius: 2px; background: ${theme.legend_info_swatch_bg}; border: 1px dashed ${theme.legend_info_swatch_border}; flex-shrink: 0;"></span>`;
      return `<div style="display: flex; align-items: center; gap: 6px;">${swatch}<span style="font-size: 12px; color: ${theme.ink_secondary};">${escapeHtml(item.label)}</span></div>`;
    })
    .join("");

  return `<div style="background: ${theme.panel_bg}; border: 1px solid ${theme.panel_border}; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 14px; box-shadow: ${theme.panel_shadow};"><span style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: ${theme.ink_secondary}; text-transform: uppercase;">${escapeHtml(panel.caption)}</span><div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start;">${frames}<div style="display: flex; flex-direction: column; gap: 8px; flex-grow: 1; min-width: 180px; padding-top: 4px;">${legend}<span style="font-size: 12px; color: ${theme.ink_secondary}; line-height: 1.5; text-wrap: pretty;">${escapeHtml(panel.note)}</span></div></div></div>`;
}

function criterionRow(row: ReportCriterionRow, isLast: boolean, theme: ReportTheme): string {
  const rowStyle =
    row.status === "fail"
      ? `padding: 18px 12px; margin: 0 -12px; background: ${theme.fail_row_tint}; border-radius: 8px;`
      : "padding: 18px 0;";
  const border = isLast ? "" : ` border-bottom: 1px solid ${theme.border};`;
  const main = `<div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; ${rowStyle}${border}"><div style="display: flex; flex-direction: column; gap: 4px; min-width: 0;"><span style="font-size: 15px; font-weight: 600; color: ${theme.ink};">${escapeHtml(row.name)}</span><span style="font-size: 13px; color: ${theme.ink_secondary}; line-height: 1.5; text-wrap: pretty;">${escapeHtml(row.detail)}</span></div><div style="flex-shrink: 0; padding-top: 2px;">${statusPill(row.status, theme)}</div></div>`;
  if (!row.panel) return main;
  return `${main}<div style="padding: 4px 0 22px 0; border-bottom: 1px solid ${theme.border};">${frameMapPanel(row.panel, theme)}</div>`;
}

// The original template looks up theme[status + "_ink"], but themes.json
// only defines accent_ink/warn_ink/danger_ink (the same three colors
// status_pill() above uses for pass/partial/fail) — mapping directly here
// rather than reproducing a dead lookup.
const STATUS_INK: Record<ReportTimelineMark["status"], keyof ReportTheme> = {
  pass: "accent_ink",
  partial: "warn_ink",
  fail: "danger_ink",
};

function timelineMark(mark: ReportTimelineMark, theme: ReportTheme, labelFirst: boolean): string {
  const dot = `<span style="width: 8px; height: 8px; border-radius: 50%; background: ${theme[STATUS_INK[mark.status]]}; flex-shrink: 0;"></span>`;
  const label = `<span style="font-size: 10px; font-weight: 600; color: ${theme.hero_secondary}; white-space: nowrap; font-variant-numeric: tabular-nums;">${escapeHtml(mark.timestamp)}</span>`;
  const align = labelFirst ? "bottom: 0;" : "top: 0;";
  const content = labelFirst ? `${label}${dot}` : `${dot}${label}`;
  return `<div style="position: absolute; left: ${mark.position}%; ${align} transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 4px;">${content}</div>`;
}

function findingCard(f: ReportFinding, theme: ReportTheme): string {
  return `<div style="border: 1px solid ${theme.card_border}; border-radius: 12px; padding: 20px 24px; display: flex; flex-direction: column; gap: 10px; box-shadow: ${theme.card_shadow};"><div style="display: flex; align-items: center; justify-content: space-between;"><span style="display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 9999px; background: ${theme.findings_badge_bg}; color: ${theme.findings_badge_text}; font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums;">${escapeHtml(f.timestamp)}</span><span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: ${theme.ink_secondary}; text-transform: uppercase;">${escapeHtml(f.tier)}</span></div><span style="font-size: 14px; font-weight: 600; color: ${theme.ink};">${escapeHtml(f.title)}</span><span style="font-size: 13px; color: ${theme.ink_secondary}; line-height: 1.5; text-wrap: pretty;">${escapeHtml(f.detail)}</span></div>`;
}

export function renderReportHtml(data: ReportData, theme: ReportTheme): string {
  const accent = data.accent ?? "#2997ff";
  const productName = data.product_name ?? "Signal";
  const total = data.score.pass_count + data.score.partial_count + data.score.fail_count;
  const scoreDash = Math.round((data.score.value / 100) * 364.4 * 10) / 10;
  const dividerColor = theme.hero_glow ? theme.hero_secondary : theme.border;
  const dividerOpacity = theme.hero_glow ? "opacity: 0.12;" : "";

  const tier1Rows = data.tier1.rows.map((row, i) => criterionRow(row, i === data.tier1.rows.length - 1, theme)).join("");
  const tier2Rows = data.tier2.rows.map((row, i) => criterionRow(row, i === data.tier2.rows.length - 1, theme)).join("");

  const rowAbove = data.findings_timeline.filter((m) => m.row === 0).map((m) => timelineMark(m, theme, true)).join("");
  const rowBelow = data.findings_timeline.filter((m) => m.row === 1).map((m) => timelineMark(m, theme, false)).join("");
  const hasTimeline = data.findings_timeline.length > 0;

  const findingsHtml = data.findings.map((f) => findingCard(f, theme)).join("");
  const checklistHtml = data.top_fix.checklist
    .map(
      (item, i) =>
        `<div style="display: flex; align-items: center; gap: 10px; ${i === 0 ? "padding-top: 8px;" : ""}"><span style="width: 16px; height: 16px; border-radius: 4px; border: 1.5px solid ${theme.checklist_box_border}; flex-shrink: 0;"></span><span style="font-size: 13px; font-weight: 600; color: ${theme.ink};">${escapeHtml(item)}</span></div>`
    )
    .join("");

  const heroGlowLayer = theme.hero_glow
    ? `<div style="position: absolute; z-index: -1; top: -160px; right: -100px; width: 420px; height: 420px; border-radius: 50%; background: radial-gradient(circle, ${theme.accent_raw} 0%, rgba(41,151,255,0) 70%); opacity: 0.18; pointer-events: none;"></div><div style="position: absolute; z-index: -1; bottom: -180px; left: -120px; width: 380px; height: 380px; border-radius: 50%; background: radial-gradient(circle, ${theme.accent_raw} 0%, rgba(41,151,255,0) 70%); opacity: 0.08; pointer-events: none;"></div>`
    : `<div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: ${theme.accent_raw};"></div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(productName)} — Best-Practice Report — ${escapeHtml(data.file.name)}</title>
<style>
  @page { size: letter; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    background: ${theme.bg};
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
</style>
</head>
<body style="--accent: ${accent};">
<div style="width: 816px; box-sizing: border-box; padding: 72px; display: flex; flex-direction: column; gap: 48px; color: ${theme.ink};">

  <div style="position: relative; overflow: hidden; background: ${theme.hero_bg}; ${theme.hero_border !== "none" ? `border-bottom: ${theme.hero_border};` : ""} margin: -72px -72px 0 -72px; width: calc(100% + 144px); padding: 56px 72px 48px 72px; display: flex; flex-direction: column; gap: 24px; box-sizing: border-box;">
    ${heroGlowLayer}
    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${theme.accent_raw}; flex-shrink: 0;"></div>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 21px; font-weight: 700; color: ${theme.ink}; letter-spacing: -0.01em;">${escapeHtml(productName)}</span>
          <span style="font-size: 11px; color: ${theme.hero_secondary};">by Creos Labs</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
        <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.16em; color: ${theme.accent_ink}; text-transform: uppercase;">Best-practice report</span>
      </div>
    </div>

    <div style="height: 1px; background: ${dividerColor}; ${dividerOpacity}"></div>

    <div style="display: flex; gap: 24px; align-items: flex-start;">
      <div style="position: relative; width: 96px; height: 171px; border-radius: 12px; background: ${theme.video_thumb_bg}; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7-11-7z" fill="${theme.video_thumb_icon}" opacity="0.85"></path></svg>
        <span style="position: absolute; bottom: 8px; right: 8px; font-size: 10px; color: ${theme.video_thumb_label}; font-weight: 600;">${escapeHtml(data.file.aspect_label)}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px; flex-grow: 1; min-width: 0;">
        <span style="font-size: 30px; font-weight: 700; color: ${theme.ink}; letter-spacing: -0.02em; text-wrap: balance;">${escapeHtml(data.file.name)}</span>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <span style="display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 9999px; background: ${theme.hero_glow ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}; border: 1px solid ${theme.hero_glow ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)"}; font-size: 12px; font-weight: 600; color: ${theme.ink}; white-space: nowrap;">${escapeHtml(data.file.format_tag)}</span>
          <span style="font-size: 13px; color: ${theme.hero_secondary};">${escapeHtml(data.file.platform)} · ${escapeHtml(data.file.date)}</span>
        </div>
      </div>
    </div>

    <div style="height: 1px; background: ${dividerColor}; ${dividerOpacity}"></div>

    <div style="display: flex; gap: 32px; align-items: center; flex-wrap: wrap;">
      <div style="position: relative; width: 136px; height: 136px; flex-shrink: 0;">
        <svg width="136" height="136" viewBox="0 0 136 136" style="transform: rotate(-90deg);">
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${theme.accent_raw}" stop-opacity="0.55"></stop>
              <stop offset="100%" stop-color="${theme.accent_raw}" stop-opacity="1"></stop>
            </linearGradient>
          </defs>
          <circle cx="68" cy="68" r="58" fill="none" stroke="${theme.score_ring_track}" stroke-width="11"></circle>
          <circle cx="68" cy="68" r="58" fill="none" stroke="url(#scoreGrad)" stroke-width="11" stroke-linecap="round" stroke-dasharray="${scoreDash} 364.4"></circle>
        </svg>
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0px;">
          <span style="font-size: 38px; font-weight: 700; color: ${theme.ink}; letter-spacing: -0.02em; line-height: 1;">${data.score.value}</span>
          <span style="font-size: 11px; color: ${theme.hero_secondary}; font-weight: 600;">/ 100</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px; flex-grow: 1; min-width: 220px;">
        <div style="display: flex; gap: 18px; flex-wrap: wrap;">
          <span style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: ${theme.ink};"><span style="width: 8px; height: 8px; border-radius: 50%; background: ${theme.legend_pass}; flex-shrink: 0;"></span>${data.score.pass_count} pass</span>
          <span style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: ${theme.ink};"><span style="width: 8px; height: 8px; border-radius: 50%; background: ${theme.legend_partial}; flex-shrink: 0;"></span>${data.score.partial_count} partial</span>
          <span style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: ${theme.ink};"><span style="width: 8px; height: 8px; border-radius: 50%; background: ${theme.legend_fail}; flex-shrink: 0;"></span>${data.score.fail_count} fail</span>
        </div>
        <div style="display: flex; width: 100%; height: 10px; border-radius: 9999px; overflow: hidden;">
          <div style="width: ${total > 0 ? Math.round((data.score.pass_count / total) * 10000) / 100 : 0}%; height: 100%; background: ${theme.legend_pass};"></div>
          <div style="width: ${total > 0 ? Math.round((data.score.partial_count / total) * 10000) / 100 : 0}%; height: 100%; background: ${theme.legend_partial};"></div>
          <div style="width: ${total > 0 ? Math.round((data.score.fail_count / total) * 10000) / 100 : 0}%; height: 100%; background: ${theme.legend_fail};"></div>
        </div>
        <span style="font-size: 13px; color: ${theme.hero_secondary};">${escapeHtml(data.score.percentile_label)} · ${total} criteria checked</span>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px;">
      <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: ${theme.hero_secondary}; text-transform: uppercase;">Benchmark vs. set median</span>
      <div style="position: relative; width: 100%; height: 8px; border-radius: 9999px; background: ${theme.benchmark_track};">
        <div style="position: absolute; left: 0; top: 0; height: 8px; width: ${data.score.value}%; border-radius: 9999px; background: ${theme.accent_raw};"></div>
        <div style="position: absolute; left: ${data.score.median}%; top: -4px; width: 2px; height: 16px; background: ${theme.benchmark_tick};"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: ${theme.hero_secondary};">
        <span>0</span>
        <span>median ${data.score.median}</span>
        <span>100</span>
      </div>
    </div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 11px; font-weight: 700; color: ${theme.tier_chip_text}; border: 1px solid ${theme.tier_chip_border}; border-radius: 4px; padding: 2px 6px; font-variant-numeric: tabular-nums;">01</span>
      <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.16em; color: ${theme.tier_chip_text}; text-transform: uppercase;">${escapeHtml(data.tier1.label)}</span>
    </div>
    <div style="display: flex; flex-direction: column; border-top: 1px solid ${theme.border};">${tier1Rows}</div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 11px; font-weight: 700; color: ${theme.tier_chip_text}; border: 1px solid ${theme.tier_chip_border}; border-radius: 4px; padding: 2px 6px; font-variant-numeric: tabular-nums;">02</span>
      <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.16em; color: ${theme.tier_chip_text}; text-transform: uppercase;">${escapeHtml(data.tier2.label)}</span>
    </div>
    <div style="display: flex; flex-direction: column; border-top: 1px solid ${theme.border};">${tier2Rows}</div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 20px;">
    <span style="font-size: 12px; font-weight: 700; letter-spacing: 0.16em; color: ${theme.tier_chip_text}; text-transform: uppercase;">Findings · ${hasTimeline ? "Timestamped" : "Spatial"}</span>

    ${
      hasTimeline
        ? `<div style="display: flex; flex-direction: column; gap: 0;">
      <div style="position: relative; height: 34px;">${rowAbove}</div>
      <div style="position: relative; height: 1px; background: ${theme.border};"></div>
      <div style="position: relative; height: 34px;">${rowBelow}</div>
    </div>`
        : ""
    }

    <div style="display: flex; flex-direction: column; gap: 12px;">${findingsHtml}</div>
  </div>

  <div style="background: ${theme.top_fix_bg}; border: 1px solid ${theme.top_fix_border}; border-radius: 16px; padding: 32px; display: flex; gap: 20px; align-items: flex-start; box-shadow: ${theme.top_fix_shadow};">
    <div style="flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; background: ${theme.top_fix_icon_bg}; border: 1px solid ${theme.top_fix_icon_border}; display: flex; align-items: center; justify-content: center;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${theme.top_fix_icon_stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z"></path></svg>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px; min-width: 0;">
      <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.16em; color: ${theme.tier_chip_text}; text-transform: uppercase;">Top fix · Clears ${data.top_fix.checklist.length} check${data.top_fix.checklist.length === 1 ? "" : "s"}</span>
      <span style="font-size: 19px; font-weight: 700; color: ${theme.ink}; line-height: 1.35; text-wrap: balance;">${escapeHtml(data.top_fix.headline)}</span>
      <span style="font-size: 14px; color: ${theme.ink_secondary}; line-height: 1.55; text-wrap: pretty;">${escapeHtml(data.top_fix.body)}</span>
      ${
        data.top_fix.checklist.length > 0
          ? `<div style="display: flex; flex-direction: column; gap: 9px; padding-top: 6px; border-top: 1px solid ${theme.top_fix_divider}; margin-top: 2px;">${checklistHtml}</div>`
          : ""
      }
    </div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 16px; align-items: center; padding-top: 8px;">
    <div style="width: 100%; height: 1px; background: ${theme.border};"></div>
    <span style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 18px; border-radius: 9999px; border: 1px solid ${theme.cta_border}; font-size: 12px; font-weight: 600; color: ${theme.cta_text};">Made these changes? Re-run ${escapeHtml(productName)} to confirm the score moves.</span>
    <span style="font-size: 12px; color: ${theme.footer_text}; letter-spacing: 0.04em;">Creos Labs · ${escapeHtml(productName)}</span>
  </div>

</div>
</body>
</html>`;
}
