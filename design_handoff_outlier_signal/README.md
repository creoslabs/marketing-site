# Handoff: Creos Labs — Outlier and Signal

## Overview

Creos Labs is one subscription covering several marketing tools. This handoff covers the two live products:

- **Outlier** (content intelligence) — tracks creators and scores every post against that creator's own running median. Nine screens, `Outlier.dc.html`.
- **Signal** (creative analysis) — scores ad creative against a fixed criteria set per format before launch. Three screens, `Signal.dc.html`.

Every screen exists in **dark (canonical)** and **light**.

## About the design files

Both `.dc.html` files are **design references in HTML**, not production code. Recreate them in the target codebase's existing framework, component library and styling approach. If none exists, pick an appropriate stack.

Each is a zoomable design board. **Ignore the board chrome** — `.dv-turn`, `.dv-thd`, `.dv-opts`, `.dv-opt`, `.dv-olabel`, `.dv-oid`, `.dv-next`, `.dv-card`'s outer frame and the `<helmet>` block. Only the content inside each `.dv-card` is the design. Inline styles and the trailing logic class are prototype constraints — use your normal styling and componentise repetition. `support.js` is the board's runtime; don't port it.

## Fidelity

**High-fidelity.** Colours, type, spacing and radii are final. Copy is final; names, handles, numbers and file names are placeholder data.

---

## Design system — "Signal"

Black-first. **Hairline structure, no shadows, no gradients. Colour only carries meaning.**

### Tokens

| Token | Dark (default) | Light |
| --- | --- | --- |
| page / chrome | `#000000` | `#faf9f7` |
| card | `#0b0b0d` | `#ffffff` |
| table header / subtle fill | `#131316` | `#f7f6f3` |
| ink primary | `#f5f5f7` | `#111` |
| ink secondary | `rgba(245,245,247,.6)` | `rgba(0,0,0,.55)` |
| ink tertiary | `rgba(245,245,247,.45)` | `rgba(0,0,0,.45)` |
| hairline | `rgba(255,255,255,.1)` | `rgba(0,0,0,.09)` |
| accent fill | `#0a84ff` | `#0a6cf0` |
| accent text / link | `#64a9ff` | `#0a6cf0` |
| accent tint bg / border / ink | `#0a1a2e` / `rgba(10,132,255,.3)` / `#d3e6ff` | `#e8f1ff` / `rgba(10,108,240,.3)` / `#0b2a52` |
| coral fill / text | `#ff6b4a` / `#ff8f75` | `#D14424` / `#D14424` |
| coral tint bg / border / ink | `#210d07` / `rgba(255,107,74,.3)` / `#ffdbd0` | `#ffeee9` / `rgba(209,68,36,.3)` / `#5c1f0c` |
| eyebrow ink | `#4da2ff` | `rgba(0,0,0,.45)` |
| headline 2nd-line grey (solid) | `#6f6f71` | `#8b8a87` |
| image placeholder | `repeating-linear-gradient(135deg,#1e1e21 0 9px,#171719 9px 18px)` | `repeating-linear-gradient(135deg,#e9e7e1 0 9px,#e3e1da 9px 18px)` |

Light is **not** an inversion — define both sets explicitly. Accent and coral sink one step on light to hold ≥4.5:1. Blue = good/actionable, coral = fails a check / destructive, ink = neutral or partial. Never a third hue.

### Type — `'Helvetica Neue', Helvetica, Arial, sans-serif` only

| Role | Spec |
| --- | --- |
| Hero headline | 46px / 700 / -.03em / line-height 1.02, two lines, second line in the solid grey token |
| Display score | 52px / 700 / -.035em, unit (`×`, `/100`) at 22px in tertiary ink |
| Product name | 28px / 700 / -.03em |
| Body | 13px / 1.5 |
| Table cell / row value | 12.5px / 500 |
| Meta | 11.5px / 400 |
| Eyebrow | 10.5px / 600 / .13em / UPPERCASE |
| Wordmark | "CREOS LABS" 13px / 700 / .14em, `®` at 8px superscript. In a product: "CREOS LABS® / OUTLIER" — same style, slash in tertiary ink at weight 400, `gap: 14px` |
| Nav item | 11.5px / 500 (active 600) / .14em / UPPERCASE — tabs, INSIGHTS ↗, SUPPORT |

All numbers use `font-variant-numeric: tabular-nums`.

**Headline grey must be a solid colour, not alpha.** An alpha grey darkens where glyphs overlap (visible at "ry" in "Every"). This was a reported bug.

### Structure & geometry

- Hairline borders only, never shadows.
- Row lists are `flex-direction: column; gap: 1px` over a hairline-coloured background, children on card colour — no per-row borders.
- Radii: cards 10px, buttons/inner stacks 8px, pills 20px, badges 5px.
- **All buttons are exactly 40px tall** (`display:flex; align-items:center`), 8px radius, 12.5px. Primary: accent fill, white ink, 600. Ghost: 1px hairline, primary ink, 500. Destructive: coral fill, white ink.
- Chrome 58px. Page gutter 28px. Card gap 14px.

### Rules

- Score is never a bare number — always paired with format and criteria count.
- Omit inapplicable content; never grey it out.
- Every number on screen must be computable by the product.
- Image thumbnails keep their own values in both themes.
- No emoji, no illustration, no decorative colour.


---

## Shared product chrome

58px, page ground, bottom hairline, `padding: 0 28px`, `gap: 26px`.

- **Lockup:** "CREOS LABS® / OUTLIER" or "/ SIGNAL" — 13px / 700 / .14em uppercase, ® at 8px superscript, slash in tertiary ink at weight 400, `gap: 14px`.
- **Tabs:** nav-item style (11.5px / .14em / UPPERCASE), `line-height: 58px`, `gap: 22px`. Active: 600, primary ink, `box-shadow: inset 0 -1px 0 <accent fill>`. Inactive: 500, secondary ink.
- **Right side:** product-specific meta, ⌘K chip (hairline, 7px radius), 26px avatar.
- Page header: numbered eyebrow ("02 / Feed"), 28px / 700 / -.03em title, 13px secondary subtitle. Landing screens (Outlier Home, Signal Library) use the 46px two-line hero with a solid-grey second line.

The lockup links back to the Creos workspace (account, billing), which is out of scope here.

---

## 1. Outlier (`Outlier.dc.html`)

Board ids: dark `1a`–`1i`, light `3a`–`3i`.

**Core idea:** every post is scored as **views ÷ that creator's median views across their trailing 20 posts on the same platform**. 4× on TikTok means the same as 4× on Instagram. Under 12 posts on a platform = **thin history** (coral pill), excluded from Trends.

**Chrome** — lockup "CREOS LABS® / OUTLIER"; tabs HOME · FEED · TRENDS · CREATORS · PROGRESS (PROGRESS carries a blue count pill of running jobs); right: "Pulled 12 min ago" meta, ⌘K chip, avatar.

**Score chip** — the atomic unit. Two lines: score (15px/700, 18px on Feed) over "IG · 62" (8.5px/600, platform + posts in the baseline). ≥4× = accent fill + white ink; below = subtle fill + hairline border.

| Id | Screen | What it must show |
| --- | --- | --- |
| 1a | Home | Hero ("Seven new outliers. / One worth taking."); 4-cell stat strip; top 5 outliers list; tint "Pattern worth taking" panel; Processing now (3 progress bars); Needs attention (thin-history creators + Pull more) |
| 1b | Feed | 5-column grid of 9:13 thumbnails, platform badge top-left, score chip bottom-left, thin-history pill top-right; handle, views, date, caption under each |
| 1c | Video detail | Three columns: 300px (9:16 video, score block, Favourite toggle, 2×4 stat grid with "i" tooltips) · centre (title, caption + hashtags, description, 5-beat structure, hook-style chips) · 330px (transcript, hook-window lines on tint) |
| 1d | Creator detail | Header, 5-cell stats, **platform switcher** (IG / TT) that swaps the views-per-post chart and median line; posts grid |
| 1e | Trends | Topics running hot (≥3 creators above median) with sparklines; hook styles with bars; tint "Worth repurposing" panel |
| 1f | Repurpose | "Keep from original" toggle chips (Tone, Beat structure, Length); topic input + Rework; Original vs Reworked side-by-side by beat; beat/word/sentence parity line |
| 1g | Creators | Watchlist table: creator + handles, median, best 30d (accent), above 2×, cadence, median trend (sparkline + %; up accent, down coral) |
| 1h | Add creator | 640px modal. One creator → many platform handles; pull range (Last N / Date range); median baseline; thin-history rule explained |
| 1i | Progress | Pipeline chips (Pull metadata → Download → Transcribe → Score → Trend match); Running jobs with %; Queue (drag to reorder); coral Failed panel with reasons + Retry; Finished recently; Settings |

**Stat definitions (1c)** — every stat has a tooltip saying where it comes from. Views, Likes, Comments, Shares, Saves, Followers are raw from the platform API at pull time. Median and Engagement are derived: Median = median views of the trailing 20 posts on that platform; Engagement = (likes + comments + shares + saves) ÷ views.

**Interactive in the mock:** Favourite toggle (1c), platform switcher (1d), keep-chips (1f).

---

## 2. Signal (`Signal.dc.html`)

Board ids: dark `2a`–`2c`, light `4a`–`4c`.

**Core idea:** assets are scored 0–100 against a **fixed criteria set per format** — video 16 criteria, static 7. **Scores are only comparable within a format**, so every score is labelled with format + criteria count and every percentile says "among video ads" / "among static ads". Criteria split into Tier 1 (structural, objective) and Tier 2 (contextual). Verdicts: Pass (accent text), Partial (secondary ink), Fail (coral).

**Chrome** — lockup "CREOS LABS® / SIGNAL"; tabs ANALYZE · LIBRARY · BENCHMARKS.

| Id | Screen | What it must show |
| --- | --- | --- |
| 2a | Library | Hero with the account-level finding; asset cards with score badge (static = accent fill, video = ink fill, "STATIC · 7" / "VIDEO · 16") and coral issue pill; table view; drop zone; coral "Across the account" pattern panel; This week |
| 2b | Video report | Report bar (file, format badge, placement, Compare, Apply fixes). Left: 9:16 frame with safe-zone overlay (coral bands top/bottom, blue dashed safe area), violation box shown only on failing seconds, timecode, play/step. Centre: score + pass/partial/fail + percentile + bar with median tick; **per-second timeline** (blue meets / grey weak / coral fails), click to seek; Tier 1 and Tier 2 tables. Right: timestamped findings — the one at the playhead highlights; click to seek; tint Top fix |
| 2c | Static report | Same shell, no timeline. Frame with lettered spatial markers (A, B, ✓) tied to findings; Tier tables with **only static criteria** — video-only checks are omitted, never greyed |

**Interactive in the mock:** 2b timeline (click to seek, play/pause, step), frame overlay and findings follow the playhead.

---

## Behaviour (both products)

- Tabs are routes under each product (`/outlier/feed`, `/signal/library`, …).
- Hover: rows lift one ground step; ghost borders go to primary ink; links darken one step.
- Loading: render card chrome and eyebrows immediately; never show a number the product hasn't computed.
- Empty: omit, don't dim. A greyed row reads as a failure.
- Progress (Outlier) and analysis status (Signal) should subscribe to the job queue, not poll per card.
- Responsive: designs are 1180px. Below ~1000px, multi-column layouts stack; grids drop columns; tables become row cards.

## Not yet designed

- Signal ANALYZE (upload / in-progress) and BENCHMARKS tabs.
- Outlier ⌘K palette, Filters panel, Favourites library.

## Files

- `Outlier.dc.html` — ids `1a`–`1i` dark, `3a`–`3i` light.
- `Signal.dc.html` — ids `2a`–`2c` dark, `4a`–`4c` light.
- `support.js` — board runtime only.
- `screens/` — PNG of each dark screen. Light screens differ only by token. The HTML is the source of truth for measurements.
