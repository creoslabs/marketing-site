# Handoff: Outlier — Creator Outlier Tracker

## Overview
Outlier is a **private, single-user macOS research tool**. It tracks a watchlist of creators across Instagram/TikTok/YouTube, scores every pulled post against that creator's own trailing median views, and surfaces cross-creator patterns worth repurposing. It is explicitly **not** a SaaS product: no onboarding, no marketing chrome, no multi-user concerns, no billing.

The core signal is the **outlier score** — `post views ÷ that creator's trailing median views`, rendered as a multiplier ("6.4×"). It must be the most visually prominent number anywhere a post appears.

Explicitly out of scope (the user rejected these): kanban/status boards, content calendars, drag-and-drop pipeline stages. No admin overhead.

## About the Design Files
`Creator Outlier Tracker.dc.html` in this bundle is a **design reference created in HTML** — a prototype showing intended look and behaviour. It is **not production code to copy**. The task is to **recreate these designs in the target codebase's existing environment** (React, SwiftUI, Tauri, Electron, etc.) using its established patterns, component library, and state management. If no environment exists yet, choose the most appropriate stack for a local macOS tool and implement the designs there.

The HTML file uses a custom template runtime (`<x-dc>`, `<sc-for>`, `<sc-if>`, `{{ hole }}`) and inline styles only. **Do not port the runtime.** Read it as a spec: `<sc-for list="{{ x }}">` is a list render, `<sc-if>` is a conditional, `{{ }}` holes map to the data shapes documented below.

## Fidelity
**High-fidelity.** Final colours, typography, spacing and geometry — recreate pixel-accurately, substituting the codebase's own primitives where they match. All values below are exact.

The board is organised as two turns, newest first:
- **Turn 8** — Signal **light** theme: options `8a` Home, `8b` Feed, `8c` Video detail, `8d` Creators, `8e` Progress
- **Turn 7** — Signal **dark** theme (canonical): options `7a` Home, `7b` Feed, `7c` Video detail, `7d` Creators, `7e` Progress

Build **dark first** — it is the default and the theme the user works in. Light exists for daylight review, screenshots and print.

---

## Design system: "Signal" (Creos Labs)

Black-first analyst tool. **Hairline structure, no shadows, no gradients** (one exception, noted below). Colour only ever carries meaning.

### Ground
| role | dark (canonical) | light |
|---|---|---|
| Page + chrome | `#000000` | `#faf9f7` (warm off-white, never pure white) |
| Cards | `#0b0b0d` | `#ffffff` |
| Table header rows | `#131316` | `#f7f6f3` |
| Asset placeholders | `repeating-linear-gradient(135deg,#1e1e21 0 9px,#171719 9px 18px)` | `repeating-linear-gradient(135deg,#e9e7e1 0 9px,#e3e1da 9px 18px)` |

Note the inverted relationship: on dark, cards (`#0b0b0d`) sit *above* black; on light, cards (`#fff`) sit above warm paper.

### Ink — layered in alpha, not in greys
| role | dark | light |
|---|---|---|
| Primary | `#f5f5f7` | `#111` |
| Secondary | `rgba(245,245,247,.6)` | `rgba(0,0,0,.55)` |
| Tertiary | `rgba(245,245,247,.45)` | `rgba(0,0,0,.45)` |

### Structure
1px hairline borders, **never shadows**: `rgba(255,255,255,.1)` dark / `rgba(0,0,0,.09)` light.

Divider stacks (tables, row lists) are `display:flex; flex-direction:column; gap:1px` over a **border-coloured background**, with children on card colour — the 1px gaps read as hairlines. Same pattern for grids via `gap:1px`.

### Accent — blue (good, actionable, primary)
| role | dark | light |
|---|---|---|
| Fill | `#0a84ff` | `#0a6cf0` |
| Ink on fill | `#ffffff` | `#ffffff` |
| Hover | — | `#0857c4` |
| Tint panel | `#0a1a2e`, border `rgba(10,132,255,.3)` | `#e8f1ff`, border `rgba(10,108,240,.3)` |
| Tint ink | `#d3e6ff` | `#0b2a52` |
| Accent text | `#64a9ff` | `#0a6cf0` |

The dark blue is tuned to glow on black (only 3.1:1 on white); the light blue holds 4.6:1 on white. **Rule: dark mode lifts the hue toward light, light mode sinks it toward dark.**

### Warn — coral (fails a check / failed job / thin history)
| role | dark | light |
|---|---|---|
| Fill | `#ff6b4a` | `#D14424` |
| Ink on fill | `#2b0b03` | `#ffffff` |
| Deep (text on tint) | — | `#A8300E` |
| Tint | `#210d07` | `#ffeee9` |
| Tint ink | `#ffdbd0` | `#5c1f0c` |

Neutral/partial states use **ink colours, never a third hue**. There is no green in this system.

### Type
`'Helvetica Neue', Helvetica, Arial, sans-serif` everywhere. **No webfonts, no monospace, no exceptions.**

| role | spec |
|---|---|
| Display score | 52px / 700 / `-.035em` |
| Page title | 22px / 700 / `-.02em` |
| Card title | 15px / 600 |
| Body | 13px / 1.5 |
| Table cell | 12.5px / 500 |
| Meta | 11.5px |
| Eyebrow | 10.5px / 600 / `letter-spacing:.13em` / UPPERCASE |

**The eyebrow is the signature move** — every card and section opens with one. `#4da2ff` on dark; `rgba(0,0,0,.45)` on light (blue eyebrows would compete with blue buttons and scores at small size — the move survives, the colour doesn't).

Numeric columns and score values use `font-variant-numeric: tabular-nums`.

Wordmark: the single word **Outlier**, 17px / 700 / `-.02em` — `#ffffff` on dark, `#111` on light.

### Geometry
Cards 10px · buttons and chips 7–8px · pills 20px · badges 4–5px · app chrome 56–58px tall · card padding 16–22px · grid gaps 14–16px.

### Rules
- Score is **never a bare number** — always paired with format and criteria count (e.g. `REEL · 62`, `rank #4 / 62`).
- **Never grey out** inapplicable content — omit it. A dimmed row reads as a failure.
- Asset thumbnails keep their own values in **both** themes — you're judging real creative; inverting it lies to the user.
- Max two grounds per screen.
- No emoji, no drawn illustration, no decorative colour. Striped placeholders stand in for imagery.
- **Every number on screen is falsifiable** — if the product couldn't compute it, don't show it.
- One sanctioned gradient: the filled-accent score block on video detail. Nothing else.

---

## Screens

### 1. Home (`7a` / `8a`) — landing view for a returning user
**Purpose:** answer "what changed since I last looked" in under five seconds.

**Layout:** app chrome (56px) → greeting row → 4-up summary tiles → two-column body `grid-template-columns: 1fr 352px`, gap 18px, page padding 22px.

- **Chrome:** wordmark, tab row (Home · Feed · Trends · Creators · Progress), spacer, "pulled 12m ago" (meta ink), ⌘K affordance in a hairline box. Active tab = filled ink block (`#f5f5f7` bg / `#000` ink on dark; `#111` bg / `#fff` ink on light), radius 7px. Inactive = secondary ink, hover = subtle ground tint.
- **Greeting:** "Good morning, Jackson" at page-title spec; sub-line "Friday, Sep 11 · 7 new outliers since you last looked" in secondary ink. Right side: "Add creator" (hairline button) + "Pull now" (filled accent).
- **Summary tiles:** 4 columns, `gap:1px` hairline grid, radius 10px. Each tile: eyebrow label, then 28px/500 value (`-.04em`, tabular), then meta sub-line. Tiles: New outliers `7` / since yesterday · Best score today `6.4×` / @lifteddaily · Posts pulled `486` / across 18 creators · Needs attention `2` / thin history.
- **Left column — "Today's top outliers":** card title + "All 41 in Feed →". Five rows in a hairline divider stack. Each row: 44×60 striped thumbnail (radius 8px) · score chip · caption line (13.5px/500, ellipsis) · avatar (20px circle, 9px initials) + "@handle · 1.2M views · Sep 8" meta · thin-history pill when applicable · trailing → in tertiary ink. Hover lifts the row ground.
- **Right column:**
  1. **Processing now** — eyebrow + "Progress →". One block per running job: title ("@marcusonmoney · 12 new posts"), percent (tabular), stage line ("Downloading video 8 of 12"), 4px progress bar (accent fill on `rgba(*,.07)` track).
  2. **Pattern worth taking** — accent **tint panel**: eyebrow in tint ink, body in tint ink, two buttons ("Repurpose this" filled accent, "See in Trends" hairline).
  3. **Needs attention** — thin-history creators only: avatar, name, "9 posts — median not reliable yet", "Pull more" hairline button.
  4. **Your recent repurposes** — title + "from @handle · 6.4× · 2h ago".

### 2. Feed (`7b` / `8b`) — ranked grid of everything pulled
**Purpose:** scan all tracked creators' posts by outlier score.

**Layout:** chrome → title row → 5-column thumbnail grid, gap 18px, padding 22px.

- **Title row:** "Top outliers" (card title) + "41 posts above 2× · last 30 days" (meta). Right: "Score ▾", "Filters · 2", "+ Add creator" (filled accent).
- **Card:** 9:13 striped thumbnail, radius 11px, containing —
  - platform badge top-**left** (`IG`/`TT`, 9px/600, `.08em`, badge radius 5px, on a 93%-opaque card-colour plate), `z-index:2`
  - thin-history pill top-**right** when flagged, same plate treatment, warn ink
  - **score chip** bottom-left, `z-index:2`: ≥4× = filled accent with white ink; <4× = plate with primary ink. 18px/600, `-.035em`, radius 8px, padding `5px 7px 6px`
  - a bottom scrim (52px, `to top`, ground-coloured at ~.7 alpha) so the chip holds over real imagery
  - Below the image: avatar (26px, initials) + handle (12.5px/500) + "1.2M views · Sep 8" meta, then the caption's first line (11.5px, secondary ink, `text-wrap:pretty`) — **caption is never overlaid on the thumbnail**, it was moved out for legibility.
- 12 posts in the fixture; scores 6.4× down to 2.0×.

### 3. Video detail (`7c` / `8c`) — analyse one post
**Purpose:** understand why a post outperformed, then repurpose it.

**Layout:** sub-header → three columns `grid-template-columns: 306px 1fr 330px`.

- **Sub-header:** "← Dashboard", hairline divider, avatar + @handle, "Sep 8 · 0:31 · 1.2M views" meta, spacer, "Repurpose →" (filled accent).
- **Left rail:**
  1. **9:16 poster** at full rail width, radius 12px, striped placeholder. Overlaid: the **score block** top-left (the one sanctioned gradient — `linear-gradient(158deg, …)` in accent, radius 12px, `padding:9px 12px 11px`) containing eyebrow "OUTLIER SCORE" in white, then `6.4` at 40px/600 `-.045em` with a lighter smaller `×`, then "rank #4 / 62" in `rgba(255,255,255,.8)`; platform badge top-right; "Sep 8 · 0:31" bottom-left; top and bottom scrims.
  2. **Two half-width buttons** directly under the poster: "☆ Favourite" (toggles to "★ Saved" — accent tint panel + tint ink when on, hairline + secondary ink when off) and "Instagram ↗" (hairline; label follows the post's platform).
  3. **Stat cards** — 2-column grid, **10px gap**, each its own card: hairline border, radius 12px, padding `13px 14px 14px`. Eyebrow label (with `padding-right:18px`), value at 20px/500 `-.035em` tabular. An **ⓘ pinned to each card's top-right** (13px circle, ground tint, cursor:help) reveals a tooltip on hover — 176px, card-ground bubble, anchored **left for left-column cards, right for right-column cards** so it never clips the rail.
     Fields and tooltip copy:
     | field | value | tooltip |
     |---|---|---|
     | Views | 1.20M | Plays as reported by the API at the last pull, 12 minutes ago. |
     | Median | 188K | *Derived, not from the API*: median views across this creator's trailing 20 posts — the baseline the score divides by. |
     | Engagement | 8.7% | (likes + comments + shares + saves) ÷ views, as returned by the API. |
     | Likes | 71.4K | Raw like count. Not used in the outlier score. |
     | Comments | 2,108 | Comment count at pull time. |
     | Shares | 12.3K | Sends to other people. Clearest sign a hook travels beyond the creator's own audience. |
     | Saves | 18.9K | Strongest repurpose signal — 1.6% of views, unusually high for this niche. |
     | Followers | 302K | *Creator-level, not post-level.* Views above follower count mean the post left the existing audience. |
- **Middle column** (in this order — it was explicitly re-ordered):
  1. **Caption** — eyebrow, then the creator's real caption in a hairline card (13px/1.6), then hashtag pills (`#gymtips` etc., pill radius 20px, ground tint).
  2. **Description** — eyebrow, then an **AI-generated analysis of what's on screen** in a hairline card (12.5px/1.6, secondary ink): shot setup, how the cold open is held, on-screen text, captions/music, how it cuts. *Do not label it "AI" in the UI* — the badge was removed.
  3. **Structure** — eyebrow, then one card per beat: beat name (accent text, 9.5px/600 `.07em`) + timecode (tertiary), then the analysis (12px/1.45). Beats: HOOK 0:00–0:04 · SETUP 0:04–0:09 · PAYOFF 0:09–0:26 · FIX 0:26–0:29 · CTA 0:29–0:31.
  4. **Hook style** — eyebrow, then tag pills (negative command · numbered payoff · second person · save-CTA), then a cross-creator note: "Same negative-command opener appears in 7 above-median posts across 4 tracked creators this month."
- **Right column — Transcript:** card title + "auto · 96 words". Rows are `grid-template-columns:34px 1fr`, gap 9px, radius 6px, padding `7px 8px`. **Hook lines (0:00, 0:04) sit on the accent tint panel with tint ink**; all other rows are transparent with secondary ink and tertiary timestamps. Row hover = ground tint.

### 4. Creators (`7d` / `8d`) — the watchlist
**Purpose:** see who's worth watching closely, and add new creators.

**Layout:** chrome → title row → header row + hairline row stack, padding 22px.

- **Title row:** "Creators" (page title) + "18 tracked · 27 handles · 2 with thin history". Right: 220px search field ("Search creators…"), "Best 30d ▾" hairline, "+ Add creator" filled accent.
- **Columns** (`1fr 96px 82px 74px 74px 92px 76px`, gap 14px): Creator · Median · Best 30d · Above 2× · Cadence · Median trend · (action). Header labels are eyebrows on the table-header ground.
- **Row:** 30px avatar w/ initials · creator **name** (13px/500) + thin-history pill + handles line ("IG @lifteddaily · TT @lifteddaily", meta, ellipsis) · median (14px/500 tabular) · best score (15px/600 **accent text**, tabular) · count above 2× · cadence ("5 / wk") · 6-bar sparkline (4px bars, 22px tall, tertiary-ink fill) + delta ("+34%") where **rising = accent text, falling = coral accent text, thin history = tertiary ink "—"** · "Open" hairline button.
- Below the stack: a dashed "+ Add creator or paste a handle" row, radius 12px.
- Fixture: 8 creators, medians 53K–233K, best scores 2.7×–6.4×.

### 5. Progress (`7e` / `8e`) — the download/analyse queue
**Purpose:** see what's being pulled, transcribed and scored right now. The nav tab carries a live count badge (`3`).

**Layout:** chrome → title row → pipeline strip → two columns `1fr 352px`.

- **Title row:** "Progress" + "3 running · 5 queued · 2 failed · 41 posts scored in the last hour". Right: "Pause all" hairline, "Retry failed" filled accent.
- **Pipeline strip:** a hairline card, eyebrow "PIPELINE", then stage pills separated by `→` (**the separator renders only between stages, never trailing**): Pull metadata → Download → Transcribe → Score → Trend match. Right-aligned: "2 downloads in parallel".
- **Running** (3 job cards, gap 10px): avatar · creator · "12 new posts · IG" · percent (17px/500 tabular) · "Cancel" hairline · 5px progress bar · stage line + ETA.
- **Queue** (5 rows, hairline stack): index, avatar, creator, scope ("full backfill · 60 posts"), wait reason, × to remove. Header says "5 waiting · drag to reorder".
- **Right column:** **Failed** on the coral tint panel — per-item reason and Retry ("Video unavailable — post deleted before download finished.", "Rate limited after 3 retries. Next attempt in 18 min.") · **Finished recently** — accent dot, creator, "reel_7710 scored 5.1×", relative time · **Settings** — Auto-pull every `6 hours`, Transcribe on `posts above 2×`, Keep video files `30 days`.

### Screens designed earlier but NOT yet on Signal
These exist as older iterations and were removed from the board when it was cut to Signal-only. **They still need building** — recreate them from these notes in the Signal system:
- **Creator detail** — avatar header (followers · posts pulled · median · tracked since), a views-per-post bar chart with a **running-median line** (median label lives in the chart header, not floating over the bars) and outliers highlighted, then a 6-up thumbnail grid of that creator's posts with score chips. **Open issue:** now that a creator holds several platform handles, this screen needs platform tabs or split series — it is still single-platform and internally inconsistent.
- **Trends** — left: topics ≥3 tracked creators are beating their own median on, each with an average multiplier, who's hitting it, and a sparkline. Right: hook styles converting regardless of topic (name, example phrasing, bar, score), plus a "worth repurposing" tint panel.
- **Repurpose** — source line, a "KEEP FROM ORIGINAL" bar with three **checkbox chips** (Tone · Beat structure · Length — tinted chip + check when on, hairline when off), a topic input + "Rework ⏎", then two columns: ORIGINAL (secondary ink) vs REWORKED (primary ink), beat-by-beat, with a footer diff ("beat count 4/4 · 94 words vs 96 · avg sentence 7.8 vs 8.1").
- **Add creator / manage watchlist** — **creator-first**: one named creator holds many platform handles. Avatar + display name, then a list of handle rows (platform dropdown + handle + ×), a dashed empty row to add another, and the note "Each platform is scored against its own median, so a 4× on TikTok and a 4× on Instagram mean the same thing. Handles under one creator roll up into a single Creator detail page." Then pull range (Last N posts / Date range toggle; "60 posts **per platform**"), median baseline ("Trailing 20 posts"), and the confidence rule: "Under 12 posts on a platform, that platform is flagged low confidence and left out of Trends." Below: the tracking list, one creator per row with handles nested (platform tag, handle, post count) and "+ handle".

---

## Interactions & behaviour
- **Nav** — five tabs, single-select. Home is the landing view.
- **⌘K palette** — shown as an affordance in every chrome; **not yet designed**. Intended: jump to creator, paste a handle, pull now, find a hook.
- **Favourite** (video detail) — local toggle; label swaps ☆ Favourite → ★ Saved, button moves to the accent tint panel. **There is no favourites/library screen yet** — see Open questions.
- **Stat tooltips** — hover/focus on the ⓘ; one open at a time; anchored per column so they never clip.
- **Keep toggles** (repurpose) — three independent booleans; chip tints and shows a check when on.
- **Queue** — rows are drag-reorderable; per-job Cancel; per-failure Retry; global Pause all / Retry failed.
- **Filters · 2** (feed) — the count reflects active filters; **the panel itself is not yet designed** (intended: score threshold, date range, platform, creator subset, confidence).
- **Hover** — rows and cards lift by one ground step; hairline buttons darken their border to primary ink. No transitions on state-carrying colours (a CSS transition on the toggle track caused a visible stale-paint bug in the prototype — animate opacity/transform if anything).
- **Empty / first-run states** — not yet designed. For a daily-use tool the empty state *is* the onboarding.

## State management
Per-screen local state is all the prototype needs; a real build needs:
- `watchlist`: creators → `{ id, displayName, initials, handles: [{platform, handle, postCount, thin}], median, bestScore, hitsAbove2x, cadence, medianTrend, spark[] }`
- `posts`: `{ id, creatorId, platform, caption, description, thumbUrl, views, median, score, postedAt, duration, likes, comments, shares, saves, engagement, thin, favourite }`
- `transcript`: `[{ t, text, isHook }]` · `beats`: `[{ name, timecode, analysis }]` · `hookTags: string[]`
- `jobs`: `{ id, creatorId, scope, stage, pct, eta, state: running|queued|failed|done, error }`
- `trends`: topics + hook styles with participating creators and average multipliers
- `settings`: `{ autoPullHours, transcribeThreshold, retainVideoDays, medianWindow: 20, thinHistoryFloor: 12 }`
- UI state: active tab, theme (dark default), filters, sort, open tooltip, favourite set, keep-flags

**Scoring:** `score = views / trailingMedian(creator, platform, window=20)`. Under 12 posts on a platform → flag **low confidence** and exclude from Trends. Score thresholds used by the visuals: **≥4× = filled accent chip**, **<4× = plate chip**, feed default filter **≥2×**.

## Design tokens
All colours, type and geometry are in the **Signal** section above. Additional values used:
- Radii: cards 10–14px · buttons/chips 7–9px · pills 20px · badges 4–5px · thumbnails 8–12px · avatars 50%
- Spacing: page padding 22px · card padding 13–16px · grid gaps 1px (hairline stacks), 10px (stat cards), 14–18px (layout)
- Progress bars: 4–5px tall, radius 3px, track `rgba(*,.07)`, fill accent
- Sparklines: 4px bars, 2px gap, 22px tall, tertiary-ink fill
- Avatars: 20/22/26/30/34px circles, initials at 9–11px/600, striped placeholder fill

## Assets
**None shipped.** Every image is a striped `repeating-linear-gradient` placeholder standing in for real creative (post thumbnails, creator avatars). In the real app these come from the platform API at pull time. Avatar fallback is the creator's two-letter initials on the striped fill. No icon set is used — the few glyphs are text characters (`→ ↗ × ▾ ⌘K ☆ ★ ⓘ`); substitute the codebase's icon library.

## Files
- `Creator Outlier Tracker.dc.html` — the full design board: turn 8 (Signal light: 8a–8e) over turn 7 (Signal dark: 7a–7e). Open in a browser; scroll or use the `#7a`-style anchors.
- `screens/trends.png`, `screens/creator-detail.png`, `screens/trends-and-creator.png` — captures of the **pre-Signal** Trends and Creator-detail screens, for layout reference only. **Their colours are obsolete** (an earlier green palette); take structure from them and colour from Signal.

## Open questions for the user
1. **Favourites/hook library** — the Favourite button has nowhere to land. This is also the main stickiness play: saved hooks accumulate into a filterable swipe file.
2. **Creator detail + multi-platform** — platform tabs, or one merged chart with split series?
3. **Own-baseline comparison** — "6.4× for them = 41K for you" requires connecting the user's own account. In scope?
4. **⌘K palette, filter panel, empty states** — all referenced by the designs, none designed yet.
