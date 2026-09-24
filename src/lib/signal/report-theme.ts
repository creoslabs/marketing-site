// Ported 1:1 from signal-report-template/themes.json — pixel-for-pixel from
// the two artboards. Edit that file's values here if the design changes;
// don't hand-tune these independently of it.
export type ReportTheme = {
  bg: string;
  ink: string;
  ink_secondary: string;
  hero_bg: string;
  hero_border: string;
  hero_secondary: string;
  hero_glow: boolean;
  border: string;
  surface: string;
  video_thumb_bg: string;
  video_thumb_icon: string;
  video_thumb_label: string;
  accent_raw: string;
  accent_ink: string;
  warn_ink: string;
  danger_ink: string;
  legend_pass: string;
  legend_partial: string;
  legend_fail: string;
  pass_bg: string;
  pass_border: string;
  partial_bg: string;
  partial_border: string;
  fail_bg: string;
  fail_border: string;
  fail_row_tint: string;
  score_ring_track: string;
  benchmark_track: string;
  benchmark_tick: string;
  tier_chip_border: string;
  tier_chip_text: string;
  card_border: string;
  card_shadow: string;
  panel_bg: string;
  panel_border: string;
  panel_shadow: string;
  frame_bg: string;
  frame_border: string;
  frame_shadow: string;
  info_tint_bg: string;
  info_tint_bg_soft: string;
  info_tint_border_dashed: string;
  info_tint_text: string;
  danger_tint_bg: string;
  danger_tint_bg_strong: string;
  danger_tint_border_dashed: string;
  danger_tint_text: string;
  hatch_strong: string;
  hatch_soft: string;
  legend_info_swatch_bg: string;
  legend_info_swatch_border: string;
  legend_hatch_strong: string;
  legend_hatch_soft: string;
  top_fix_bg: string;
  top_fix_border: string;
  top_fix_shadow: string;
  top_fix_icon_bg: string;
  top_fix_icon_border: string;
  top_fix_icon_stroke: string;
  top_fix_divider: string;
  checklist_box_border: string;
  findings_badge_bg: string;
  findings_badge_text: string;
  cta_border: string;
  cta_text: string;
  footer_text: string;
};

export const LIGHT_THEME: ReportTheme = {
  bg: "#FFFFFF",
  ink: "#16171A",
  ink_secondary: "#5D5D68",
  hero_bg: "#F7F7F9",
  hero_border: "1px solid #E4E4E9",
  hero_secondary: "#5D5D68",
  hero_glow: false,
  border: "#E4E4E9",
  surface: "#FAFAFB",
  video_thumb_bg: "#1C1C1F",
  video_thumb_icon: "#F5F5F7",
  video_thumb_label: "#A3A3AB",
  accent_raw: "var(--accent)",
  accent_ink: "#175CD3",
  warn_ink: "#B45309",
  danger_ink: "#B91C1C",
  legend_pass: "#175CD3",
  legend_partial: "#B45309",
  legend_fail: "#B91C1C",
  pass_bg: "rgba(23, 92, 211, 0.08)",
  pass_border: "rgba(23, 92, 211, 0.22)",
  partial_bg: "rgba(180, 83, 9, 0.08)",
  partial_border: "rgba(180, 83, 9, 0.22)",
  fail_bg: "rgba(185, 28, 28, 0.08)",
  fail_border: "rgba(185, 28, 28, 0.22)",
  fail_row_tint: "rgba(185, 28, 28, 0.035)",
  score_ring_track: "rgba(0, 0, 0, 0.08)",
  benchmark_track: "rgba(0, 0, 0, 0.08)",
  benchmark_tick: "#16171A",
  tier_chip_border: "rgba(23, 92, 211, 0.3)",
  tier_chip_text: "#175CD3",
  card_border: "#E4E4E9",
  card_shadow: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
  panel_bg: "#FAFAFB",
  panel_border: "#E4E4E9",
  panel_shadow: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
  frame_bg: "#FFFFFF",
  frame_border: "#D8D8DF",
  frame_shadow: "0 1px 2px rgba(16,24,40,0.06), 0 2px 5px rgba(16,24,40,0.06)",
  info_tint_bg: "rgba(23, 92, 211, 0.12)",
  info_tint_bg_soft: "rgba(23, 92, 211, 0.08)",
  info_tint_border_dashed: "rgba(23, 92, 211, 0.4)",
  info_tint_text: "#175CD3",
  danger_tint_bg: "rgba(185, 28, 28, 0.10)",
  danger_tint_bg_strong: "rgba(185, 28, 28, 0.18)",
  danger_tint_border_dashed: "rgba(185, 28, 28, 0.35)",
  danger_tint_text: "#B91C1C",
  hatch_strong: "rgba(185, 28, 28, 0.22)",
  hatch_soft: "rgba(185, 28, 28, 0.06)",
  legend_info_swatch_bg: "rgba(23,92,211,0.18)",
  legend_info_swatch_border: "rgba(23,92,211,0.45)",
  legend_hatch_strong: "rgba(185,28,28,0.4)",
  legend_hatch_soft: "rgba(185,28,28,0.15)",
  top_fix_bg: "rgba(23, 92, 211, 0.05)",
  top_fix_border: "rgba(23, 92, 211, 0.28)",
  top_fix_shadow: "0 1px 2px rgba(16,24,40,0.04), 0 4px 10px rgba(23,92,211,0.06)",
  top_fix_icon_bg: "rgba(23, 92, 211, 0.10)",
  top_fix_icon_border: "rgba(23, 92, 211, 0.30)",
  top_fix_icon_stroke: "#175CD3",
  top_fix_divider: "rgba(23, 92, 211, 0.18)",
  checklist_box_border: "#175CD3",
  findings_badge_bg: "#16171A",
  findings_badge_text: "#F5F5F7",
  cta_border: "rgba(23, 92, 211, 0.3)",
  cta_text: "#175CD3",
  footer_text: "#5D5D68",
};

export const DARK_THEME: ReportTheme = {
  bg: "#050506",
  ink: "#F0F0F2",
  ink_secondary: "#9CA0AA",
  hero_bg: "#101014",
  hero_border: "none",
  hero_secondary: "#A3A3AB",
  hero_glow: true,
  border: "rgba(255,255,255,0.14)",
  surface: "#0B0B0E",
  video_thumb_bg: "#1C1C1F",
  video_thumb_icon: "#F5F5F7",
  video_thumb_label: "#A3A3AB",
  accent_raw: "var(--accent)",
  accent_ink: "#6DB4FF",
  warn_ink: "#FFB84D",
  danger_ink: "#FF8A80",
  legend_pass: "#2997FF",
  legend_partial: "#FF9F0A",
  legend_fail: "#FF453A",
  pass_bg: "rgba(41, 151, 255, 0.14)",
  pass_border: "rgba(41, 151, 255, 0.40)",
  partial_bg: "rgba(255, 159, 10, 0.14)",
  partial_border: "rgba(255, 159, 10, 0.40)",
  fail_bg: "rgba(255, 69, 58, 0.14)",
  fail_border: "rgba(255, 69, 58, 0.40)",
  fail_row_tint: "rgba(255, 69, 58, 0.06)",
  score_ring_track: "rgba(255,255,255,0.10)",
  benchmark_track: "rgba(255, 255, 255, 0.12)",
  benchmark_tick: "#F5F5F7",
  tier_chip_border: "rgba(41, 151, 255, 0.45)",
  tier_chip_text: "#6DB4FF",
  card_border: "rgba(255,255,255,0.14)",
  card_shadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 6px rgba(0,0,0,0.35)",
  panel_bg: "#0B0B0E",
  panel_border: "rgba(255,255,255,0.12)",
  panel_shadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 6px rgba(0,0,0,0.35)",
  frame_bg: "#0F0F12",
  frame_border: "rgba(255,255,255,0.18)",
  frame_shadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 6px rgba(0,0,0,0.4)",
  info_tint_bg: "rgba(41, 151, 255, 0.16)",
  info_tint_bg_soft: "rgba(41, 151, 255, 0.14)",
  info_tint_border_dashed: "rgba(41, 151, 255, 0.45)",
  info_tint_text: "#6DB4FF",
  danger_tint_bg: "rgba(255, 69, 58, 0.14)",
  danger_tint_bg_strong: "rgba(255, 69, 58, 0.22)",
  danger_tint_border_dashed: "rgba(255, 69, 58, 0.4)",
  danger_tint_text: "#FF8A80",
  hatch_strong: "rgba(255,69,58,0.28)",
  hatch_soft: "rgba(255,69,58,0.08)",
  legend_info_swatch_bg: "rgba(41,151,255,0.22)",
  legend_info_swatch_border: "rgba(41,151,255,0.5)",
  legend_hatch_strong: "rgba(255,69,58,0.5)",
  legend_hatch_soft: "rgba(255,69,58,0.18)",
  top_fix_bg: "rgba(41, 151, 255, 0.10)",
  top_fix_border: "rgba(41, 151, 255, 0.42)",
  top_fix_shadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 14px rgba(0,0,0,0.3)",
  top_fix_icon_bg: "rgba(41, 151, 255, 0.16)",
  top_fix_icon_border: "rgba(41, 151, 255, 0.45)",
  top_fix_icon_stroke: "#6DB4FF",
  top_fix_divider: "rgba(41, 151, 255, 0.22)",
  checklist_box_border: "#6DB4FF",
  findings_badge_bg: "var(--accent)",
  findings_badge_text: "#050506",
  cta_border: "rgba(41, 151, 255, 0.4)",
  cta_text: "#6DB4FF",
  footer_text: "#9CA0AA",
};
