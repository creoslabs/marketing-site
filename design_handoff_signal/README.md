# Handoff: Signal — ad asset analyzer (Creos Labs)

## Overview

Signal takes an uploaded ad asset (static image or video), runs it against a fixed
best-practice criteria set, and returns a 0–100 score, a per-criterion breakdown, and a
ranked list of fixes with impact estimates. The product goal is better ad assets before
spend, not reporting on spend after the fact.

Primary users: performance marketers at brands, creative strategists at agencies, growth
teams at DTC startups. Agencies upload in batches; brands upload one at a time.

## About the design files

`Ad Analyzer.dc.html` in this bundle is a **design reference created in HTML** — a
prototype showing intended look and behaviour. It is not production code to port.

The task is to **recreate these designs in the target codebase's existing environment**
(React, Vue, SwiftUI, native, whatever is already there) using its established component
library, routing, and state patterns. If no environment exists yet, pick the most
appropriate framework and implement there.

Two specific things in the prototype are prototype-only and should not be carried over:
- Styling is 100% inline `style=""` attributes. That is a constraint of the prototyping
  environment. In a real codebase use whatever the codebase uses — CSS modules, Tailwind,
  styled-components.
- Asset imagery is a diagonal-stripe CSS gradient placeholder. Real thumbnails/video
  frames replace it everywhere.

## Fidelity

**High-fidelity.** Colours, type, spacing, and radii are final and exact — reproduce them.
Layout structure is final. Copy is final and should be used verbatim; it was written to be
falsifiable (every number shown is one the product could actually compute) and the tone is
deliberate — direct, specific, no hedging, no exclamation.

Interaction is partially real: the video report's timeline scrubber genuinely works in the
prototype. Everything else is static and its behaviour is described below.

## How the prototype file is organised

The file is a design canvas, not an app. It contains five `<section>` turns, newest at the
top, each holding 2–3 options that were explored. **Turn 5 and turn 4 are current. Turns
1–3 are earlier explorations that predate the final criteria model and should be treated
as history, not spec** — in particular `1c` and `2a` show a scoring model that was
superseded.

Build from these:

| id | Screen | Theme |
|----|--------|-------|
| `5b` | Video report | Dark (canonical) |
| `5a` | Static report | Dark |
| `5c` | Library + upload | Dark |
| `4a` | Video report | Light |
| `4b` | Static report | Light |
| `4c` | Score-in-context patterns (cards, table, batch) | Light |

---

# Core domain rule: format branching

**This is the most important rule in the product.** A video ad and a static ad are scored
against different criteria sets and their scores are not comparable.

**Video — 16 criteria**

Tier 1, structural, frame-precise (10):
safe-zone overlap across full runtime · cut frequency vs platform pacing ·
hook window motion detected · hook window face detected · hook window text on screen ·
hook window audio onset · aspect ratio · resolution · duration · on-screen text coverage

Tier 2, contextual, judgement (6):
product first appearance · product visible duration · message clarity in hook window ·
native feel vs polished ad · text legibility & hold time · sound-off redundancy

**Static — 7 criteria**

Tier 1, structural, pixel-precise (4):
safe-zone overlap · aspect ratio · resolution · on-screen text legibility

Tier 2, contextual, judgement (3):
product framing & legibility · scroll-stopping composition · message clarity at a glance

**Consequences for the UI:**

1. Video-only criteria **must not appear at all** on a static report. Do not render them
   greyed out or marked N/A — a dimmed row reads as a failed check. Omit them.
2. Every surface showing a score labels its format and criteria count. Never a bare
   number. Report header: `BEST PRACTICE SCORE (VIDEO) — 16 CRITERIA`. Library card badge:
   `81` over `STATIC · 7`. Table cell: `70 / video`.
3. Percentiles are always within-format: "28th percentile among video ads in this set."
4. Batch summaries show two medians, split by format, never one blended number.
5. Selecting a static and a video for comparison shows only the criteria they share, and
   says so. It never averages them.
6. The video report has a scrubbable timeline and timestamped findings. The static report
   has a single-frame overlay and spatially-anchored findings (markers A, B, ✓ on the
   asset, matched to cards in the findings panel). No timeline on static — nothing in a
   static ad changes over time.

---

# Design tokens

## Colour — dark theme (canonical)

| Token | Value | Use |
|---|---|---|
| ground | `#000000` | page background, app chrome |
| surface | `#0b0b0d` | cards, panels |
| surface-header | `#131316` | table/list header rows |
| placeholder-a | `#1e1e21` | asset stripe light band |
| placeholder-b | `#171719` | asset stripe dark band |
| ink | `#f5f5f7` | primary text |
| ink-60 | `rgba(245,245,247,.6)` | secondary text |
| ink-45 | `rgba(245,245,247,.45)` | tertiary text, captions |
| hairline | `rgba(255,255,255,.1)` | all borders |
| hairline-strong | `rgba(255,255,255,.18)` | secondary button borders |
| accent | `#0a84ff` | primary action, pass state, score bar |
| accent-ink | `#ffffff` | text on accent fill |
| accent-text | `#64a9ff` | accent-coloured text on tint |
| accent-tint | `#0a1a2e` | callout panel background |
| accent-tint-border | `rgba(10,132,255,.3)` | callout panel border |
| accent-tint-ink | `#d3e6ff` | body text inside callout |
| eyebrow | `#4da2ff` | section eyebrow labels |
| warn | `#ff6b4a` | fail state, violation overlay |
| warn-ink | `#2b0b03` | text on warn fill |
| warn-text | `#ff8f75` | warn-coloured text on tint |
| warn-tint | `#210d07` | warn callout background |
| warn-tint-ink | `#ffdbd0` | body text inside warn callout |

## Colour — light theme

| Token | Value | Use |
|---|---|---|
| ground | `#faf9f7` | page background — warm off-white, never `#fff` |
| surface | `#ffffff` | cards |
| surface-header | `#f7f6f3` | table/list header rows |
| placeholder-a / b | `#e9e7e1` / `#e3e1da` | asset stripe |
| ink | `#111` | primary text |
| ink-55 | `rgba(0,0,0,.55)` | secondary |
| ink-45 | `rgba(0,0,0,.45)` | tertiary, and eyebrows |
| hairline | `rgba(0,0,0,.09)` | borders |
| hairline-strong | `rgba(0,0,0,.16)` | secondary button borders |
| accent | `#0a6cf0` | primary action, pass state |
| accent-hover | `#0857c4` | |
| accent-tint | `#e8f1ff` | callout background |
| accent-tint-ink | `#0b2a52` | callout body text |
| warn | `#D14424` | fail state |
| warn-deep | `#A8300E` | warn text on tint |
| warn-tint | `#ffeee9` | warn callout background |
| warn-tint-ink | `#5c1f0c` | warn callout body |

**The cross-theme rule:** dark lifts each hue toward light, light sinks it toward dark.
Same hue family, different luminance, so both hold ≥4.5:1 on their own ground. Do not use
the dark blue on white (3.1:1, reads weak) or the light blue on black.

**Semantics:** blue = pass / primary action. Warn = fails a check. Partial/neutral states
use ink colours, never a third hue. Colour is never decorative.

## Typography

`'Helvetica Neue', Helvetica, Arial, sans-serif` everywhere. No webfonts, no monospace, no
exceptions — this includes overlay labels and timecodes.

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Display score | 52px | 700 | −0.035em |
| Page title | 22px | 700 | −0.02em |
| Wordmark | 17px | 700 | −0.02em |
| Card title | 15px | 600 | — |
| Body / table header cell | 13px | 500–600 | — |
| Table cell, note body | 12.5px | 500 | 1.5 line-height |
| Meta, caption | 11.5px | 400–500 | — |
| **Eyebrow** | 10.5px | 600 | **0.13em, UPPERCASE** |
| Badge / overlay label | 9.5–10px | 600 | — |

The **eyebrow** is the signature element: every card and section opens with one.
`#4da2ff` on dark, `rgba(0,0,0,.45)` on light. On dark it is blue; on light it is grey
because blue eyebrows there would compete with the blue buttons and score bars.

Body line-height 1.5, headings 1.15.

## Geometry & spacing

Cards and panels 10px radius · buttons, chips, secondary controls 7–8px · pills 20px ·
badges and overlay labels 4–5px · score/progress bars 4px (8px tall).

App chrome height 56–58px. Card padding 14–22px. Page padding 22–26px. Grid gaps 14–16px.
Report body is a two-column grid: `1fr 420px`, split by a hairline.

**Borders, never shadows.** No elevation, no drop shadows anywhere. Divider stacks are
`display:flex; flex-direction:column; gap:1px` on a hairline-coloured background with
children on the surface colour — this produces exact 1px rules that survive reordering.

## Wordmark

The word "Signal" alone, 17px/700/−0.02em. Black `#000` on light chrome, white `#fff` on
dark chrome. No lockup, no mark, no "Creos Labs" sub-line.

---

# Screens

## 1. Library + upload (`5c` dark)

**Purpose:** the home surface. See every analyzed asset, spot account-wide patterns, start
a new analysis.

**Layout:** app chrome (58px) over a `1fr 340px` grid, 26px gap, 26px/22px page padding.

**Chrome:** wordmark, then nav items at 13px — Analyze, Library (active), Benchmarks — then
spacer, then a `⌘K` affordance at 12px in a hairline-bordered 7px box. Active nav item is a
filled chip: ink background, ground-coloured text, 9px×14px padding, 7px radius.

**Left column:**
- Title block: "Library" 22px/700, subtitle 13px ink-60 reading
  `64 assets · statics median 63 · videos median 58` — two medians, never one.
- Controls right-aligned on the same baseline: `Score ▾`, `Filters · 2` (secondary:
  surface fill, hairline-strong border), `+ Analyze` (primary: accent fill).
- Asset grid, 4 columns, 16px gap. Each card: 10px radius, hairline border, 190px
  placeholder region, 12px/13px meta footer.
  - Score badge top-left of the thumbnail, 10px inset: 7px radius, 7px×9px padding,
    score 16px/700 over format label 8.5px/600/0.06em. **Static badges use accent fill
    with accent-ink text; video badges use ink fill with ground-coloured text** — format
    is legible before you read the label.
  - Optional issue pill bottom-left: 10.5px/600, warn fill, warn-ink text, 20px radius —
    e.g. `1 safe-zone fail`, `no hook`.
  - Footer: filename 12.5px/500 ink, then `Sep 9 · 93rd of statics` 11px ink-45.
- Below the grid, an overflow table in the same card treatment: header row on
  surface-header, columns ASSET (flex) / FORMAT / SCORE / PERCENTILE / FAILED CHECKS.
  Format column reads `Static · 7 criteria`. A failed-check count above ~5 is warn-coloured
  and weight 600.

**Right column** (340px, 14px gap):
- Upload dropzone: 1.5px dashed accent-at-50% border, surface fill, 12px radius, centred
  stack — 48px rounded icon tile on accent-tint, "Drop an asset to analyze" 15px/600,
  "Static or video · up to 500 MB" 12px ink-45, then an accent button.
- Appearance card: eyebrow `APPEARANCE`, then a 3-up segmented control (Light / Dark /
  System) — active segment is accent-filled, inactive are hairline-bordered. Caption
  explains that asset thumbnails and safe-zone overlays never invert.
- Account-pattern callout on warn-tint: eyebrow `ACROSS THE ACCOUNT`, a specific finding
  ("Eleven assets have no brand mark in the top third…"), and a `See the pattern →` link
  in warn-text.

## 2. Video report (`5b` dark, `4a` light)

**Purpose:** diagnose one video asset frame by frame.

**Chrome (56px):** `← Library` · filename 13.5px/600 · format badge `VIDEO · 0:18 · 9:16`
(inverted fill, 11px/600/0.06em, 4px radius) · placement + recency 12px ink-45 · spacer ·
`Compare` (secondary) · `Apply fixes →` (accent).

**Body:** `1fr 420px` grid split by a hairline.

**Left — player column (250px fixed):**
- 9:16 frame, 444px tall, 10px radius, placeholder stripe.
- Safe-zone overlay, always on: top band 116px and bottom band 158px filled
  `warn @ 16%` with a dashed warn border on the inner edge; the safe region inset 14px
  horizontally between them, outlined in dashed accent. A `SAFE ZONE · TIKTOK` tag sits
  just above the bottom band in accent fill.
- Violation overlay, conditional: when the current frame fails a check, a 1.5px warn box
  with warn-tint fill marks the offending region, labelled `OUTSIDE SAFE ZONE` in warn
  fill. Toggled by opacity so layout never shifts.
- Timecode chip top-left: `0:04 / 0:18`, inverted fill.
- Transport row under the frame: `◀` / play-pause (accent, flexes to fill) / `▶`.
- Current-frame chip: eyebrow `AT 0:04`, then a plain-language description of what is on
  screen at that moment ("caption outside safe zone").

**Left — score column (flex):**
- Eyebrow `BEST PRACTICE SCORE (VIDEO) — 16 CRITERIA`.
- Score 52px/700 beside a two-line block: `6 pass · 4 partial · 6 fail` 14.5px/600, then
  the percentile sentence with the non-comparability caveat.
- Score bar: 8px track on `rgba(255,255,255,.1)`, fill in ink (video) at score %, plus a
  2px ink tick at the format median. Labels below: `0` / `video median 64` / `100`.
- Eyebrow `TIMELINE · CLICK TO SCRUB`, then 19 tick columns, `flex:1` each, 2px gap, 52px
  tall, 3px radius. Tick colour encodes that second's state: accent-at-70% meets guidance,
  `rgba(255,255,255,.14)` weak, warn-at-75% fails. The current tick carries a 2px inset
  ink ring; a 2px ink playhead is absolutely positioned at `t/18 × 100%`, overhanging 4px
  top and bottom. A second row below repeats a timecode every third tick at 9px.
- Legend, three swatch+label pairs at 11.5px.
- Two criteria tables, 14–18px apart. Header: eyebrow on the left, `4 / 10` on the right,
  on surface-header. Rows: name (flex, 12.5px/500) · evidence (120px, 11.5px ink-45) ·
  verdict (52px, right-aligned, 12px/600 — accent for Pass, warn for Fail, ink-60 for
  Partial). The evidence column is the point of the table: `0:04–0:07, 0:17–0:18`,
  `2 cuts / 18s`, `61% of runtime` — never a bare verdict.

**Right — findings panel (420px):**
- Header row: eyebrow `FINDINGS · TIMESTAMPED` and the hint "Click a note to jump".
- Seven note cards, 10px gap. Each: timestamp chip (warn fill if the note is a failure,
  otherwise neutral) · criterion name 12.5px/600 · spacer · tier label 10px/600/0.06em
  ink-45 · then 12.5px/1.5 body.
- **Active state:** a note within ±1s of the playhead gets an accent border and
  accent-tinted background. Clicking any note seeks the player to its timestamp. This
  two-way link between timeline and findings is the core interaction of the screen.
- Bottom callout on accent-tint: eyebrow `TOP FIX · CLEARS 4 CHECKS`, the single
  highest-leverage change, and a `Preview the cut` button.

## 3. Static report (`5a` dark, `4b` light)

Same chrome and `1fr 420px` split. Differences from video:

- Frame is 4:5, 300px wide × 375px tall. Safe-zone bands are 52px top / 78px bottom.
- **No transport, no timeline, no playhead.** A caption states why: "Single-frame overlay.
  No timeline — nothing in a static ad changes over time."
- Violation box is static and always visible, labelled `B · CTA OUTSIDE`. A second marker
  `A` (ink circle, 26px) sits on the region referenced by the clarity finding.
- Header reads `BEST PRACTICE SCORE (STATIC) — 7 CRITERIA`; score bar fill is accent
  (a passing score) rather than ink.
- Tables are 4 rows and 3 rows. A caption under them states that video-only checks are
  absent by design, "a greyed row would read like a failure."
- Findings panel is `FINDINGS · SPATIAL`, hint "Hover to highlight the region". Each card
  leads with a 20px circular marker matching the asset: warn-filled `B`, ink-filled `A`,
  accent-filled `✓`. The `✓` card is a *positive* finding telling the user what not to
  change — this is deliberate and should survive.

## 4. Score-in-context patterns (`4c`)

Not a screen — the set of places a score appears outside the report, all carrying format
context. Reuse as components: library card badge, table row, split batch medians, and the
compare guard (a warn-tint panel stating that a mixed-format comparison shows only shared
criteria and never averages).

---

# Interactions & behaviour

**Implemented in the prototype — video timeline:**
- State: `t` (integer second, 0–18) and `playing`.
- Clicking any tick seeks to that second. `◀`/`▶` step ±1, clamped.
- Play advances one second every 650ms and wraps 18 → 0. Button label toggles Play/Pause.
- Interval is cleared on unmount.
- Derived from `t`: frame label, violation-overlay opacity, playhead position, tick ring,
  and each note's active styling.
- Clicking a note seeks to its timestamp.

In production, drive this from real video `currentTime` rather than a 1s-step interval;
keep the ±1s activation window for note highlighting.

**Described but static:**
- Upload: drag-over should highlight the dropzone border. Analysis runs through a progress
  state; format is detected on ingest and determines which criteria set is applied.
- `Apply fixes →` and `Preview the cut` open a preview of the recommended change.
- `Compare` enters side-by-side; if the selection mixes formats, show the compare guard.
- Library filters and sort are non-functional in the prototype.
- Theme switching: dark is the default. Asset thumbnails and safe-zone overlays keep their
  values in both themes.

# State

Per-asset: `format` ('video' | 'static'), `criteria[]` with tier / name / evidence string /
verdict, `score`, `percentileWithinFormat`, `findings[]` (video: `timestamp`; static:
`marker` + region box), `topFix`.

Per-report view: `currentTime`, `playing`, `activeFindingIds` (derived).

Library: `assets[]`, `sort`, `filters`, `medianByFormat` — two values, not one.

Fetching: the report is a single read of a completed analysis. Analysis itself is a job —
poll or stream status through the in-progress state.

# Assets

None to transfer. All imagery is a CSS stripe placeholder; icons are text glyphs
(`◀ ▶ ✓ → ▾ ⌘K`). Real thumbnails, poster frames, and an icon set come from the
implementing codebase.

# Files

- `Ad Analyzer.dc.html` — the full design canvas, all five turns.
- Build from turns 5 and 4 (`5a` `5b` `5c` `4a` `4b` `4c`). Turns 1–3 are superseded
  history; `1c` and `2a` in particular show an obsolete scoring model.
- `support.js` is prototyping-environment runtime. Ignore it.
