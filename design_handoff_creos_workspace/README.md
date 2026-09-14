# Handoff: Creos Labs — account workspace (Overview + Billing)

## Overview

Creos Labs is a two-product account. **Outlier** is a creator-research tool (tracks a watchlist of Instagram/TikTok creators and scores each post against that creator's own median views). **Signal** is an ad-creative analyser (scores assets against a fixed criteria set per format and flags failed checks).

This handoff covers the **account workspace that sits above both products** — the screen a logged-in user lands on. It has three tabs:

| Tab | State | Purpose |
| --- | --- | --- |
| Overview | designed | Pick a product; see each one's headline numbers and the plan/usage summary |
| Account | **not designed** | Profile, email, password, connections. Follow Billing's card-and-rows pattern |
| Billing | designed | Usage this period, invoices, current plan, payment method, billing details |

Each designed tab exists in **both themes**: dark (canonical) and light.

## About the design files

`Creos Labs Workspace.dc.html` in this bundle is a **design reference written in HTML** — a prototype showing intended layout, styling and copy. It is **not production code to copy**.

The task is to **recreate these designs in the target codebase's existing environment** (React, Vue, SwiftUI, native, whatever is in place), using its established component library, routing and styling patterns. If no environment exists yet, choose the most appropriate framework for the project and implement there.

Two things about the file that are artifacts of the prototype, not design intent:

- It is a "design board" — each screen is a fixed-width card inside a zoomable canvas, with an id badge (`10a`, `11b`) and a caption above it. **Ignore the board chrome**: `.dv-turn`, `.dv-thd`, `.dv-opts`, `.dv-opt`, `.dv-olabel`, `.dv-card`, `.dv-oid`, `.dv-next`, and the `<helmet>` block. Only the content inside each `.dv-card` is the design.
- Styling is entirely inline, and repeated lists are driven by a small logic class at the bottom of the file (`renderVals()` returns `usage`, `invoices`, etc.). That is a constraint of the prototyping environment. In a real codebase, use your normal styling approach and componentise the repetition.

## Fidelity

**High-fidelity.** Colours, typography, spacing and radii are final and come from a defined design system (below). Recreate the UI faithfully using the codebase's existing primitives where they match the tokens; where they don't, follow the tokens here — they are deliberate (see the dark/light accent rule).

Only two things are deliberately unfinished: the Account tab, and the numbers themselves (placeholder data).

---

## Design system — "Signal"

Black-first analyst tool. **Hairline structure, no shadows, no gradients. Colour only ever carries meaning.**

### Ground

| | Dark (canonical) | Light |
| --- | --- | --- |
| Page + chrome | `#000000` | `#faf9f7` (warm off-white, never pure white) |
| Cards | `#0b0b0d` | `#ffffff` |
| Table header rows | `#131316` | `#f7f6f3` |

Note the inverted relationship: on dark, cards sit *above* black; on light, cards sit *above* warm paper. Never pure white as the page — the hairlines disappear.

Asset/image placeholders (credit-card art, avatars, thumbnails):
- dark `repeating-linear-gradient(135deg,#1e1e21 0 9px,#171719 9px 18px)`
- light `repeating-linear-gradient(135deg,#e9e7e1 0 9px,#e3e1da 9px 18px)`

### Ink — layered in alpha, not in greys

| | Dark | Light |
| --- | --- | --- |
| Primary | `#f5f5f7` | `#111` |
| Secondary | `rgba(245,245,247,.6)` | `rgba(0,0,0,.55)` |
| Tertiary | `rgba(245,245,247,.45)` | `rgba(0,0,0,.45)` |

### Structure

Hairline borders, **never shadows**: `1px solid rgba(255,255,255,.1)` dark, `1px solid rgba(0,0,0,.09)` light.

Divider stacks (tables, row lists) are `display:flex; flex-direction:column; gap:1px` over a **border-coloured background**, with each child on the card colour. Same for horizontal stat strips (`display:flex; gap:1px`). This is how every row list in the design is built — do not use per-row `border-bottom`.

### Accent — electric blue = good / actionable / primary

| | Dark | Light |
| --- | --- | --- |
| Fill | `#0a84ff` | `#0a6cf0` |
| Ink on fill | `#ffffff` | `#ffffff` |
| Accent text/link | `#64a9ff` | `#0a6cf0` |
| Tint panel bg | `#0a1a2e` | `#e8f1ff` |
| Tint panel border | `rgba(10,132,255,.3)` | `rgba(10,108,240,.3)` |
| Ink on tint | `#d3e6ff` | `#0b2a52` |

Light mode's blue is **one step deeper on purpose**: `#0a84ff` is tuned to glow on black and only hits 3.1:1 on white; `#0a6cf0` holds 4.6:1. Hover `#0857c4`.

### Warn — coral = fails a check

| | Dark | Light |
| --- | --- | --- |
| Base | `#ff6b4a` | `#D14424` |
| Accent text | `#ff8f75` | `#D14424` |
| Tint bg | `#210d07` | `#ffeee9` |
| Ink on tint | `#ffdbd0` | `#5c1f0c` |

The rule for both hues: **dark lifts the hue toward light, light sinks it toward dark.** Same hue family, different luminance.

Neutral/partial states use ink colours — never a third hue.

### Type

`'Helvetica Neue', Helvetica, Arial, sans-serif` **everywhere**. No webfonts, no mono, no exceptions.

| Role | Spec |
| --- | --- |
| Display score | 52px / 700 / -.035em |
| Page title | 22px / 700 / -.02em |
| Card title | 15px / 600 |
| Body | 13px / 1.5 |
| Table cell | 12.5px / 500 |
| Meta | 11.5px / 400 |
| Eyebrow | 10.5px / 600 / letter-spacing .13em / UPPERCASE |
| Big stat | 20px / 700 / -.03em, `font-variant-numeric: tabular-nums` |

**The eyebrow is the signature move** — every card and section opens with one. Colour is the one real divergence between themes: `#4da2ff` on dark, but `rgba(0,0,0,.45)` on light. On light, blue eyebrows would compete with the blue buttons and blue progress bars — too many blue things at small size. The move survives; the colour doesn't.

All numeric values use `font-variant-numeric: tabular-nums`.

### Geometry

| | |
| --- | --- |
| Cards | 10px radius |
| Buttons, chips, cells | 7–8px |
| Pills / progress tracks | 20px |
| Badges | 4–5px |
| App chrome height | 57px (tab row a further 44px) |
| Card padding | 18–28px |
| Grid gaps | 14px |

### Rules

- Score is never a bare number — always paired with its format and criteria count.
- Never grey out inapplicable content — **omit it**. A dimmed row reads as a failure.
- Asset thumbnails and overlays keep their own values in both themes — you're judging real creative; inverting it lies to the user.
- Max two grounds per screen.
- No emoji, no drawn illustration, no decorative colour. Striped placeholders stand in for imagery.
- **Every number on screen is falsifiable** — if the product couldn't compute it, don't show it.

---

## Screens

Both designed screens share the same shell. Design width **1180px**.

### Shell (all tabs)

**Row 1 — chrome, 57px, page-coloured, bottom hairline, `padding: 0 24px`, `gap: 22px`, centred:**

- Wordmark "Creos Labs" — 17px / 700 / -.02em. `#ffffff` on dark, `#111` on light. Single word pair, no tagline lockup.
- Flex spacer.
- "Docs", "Support" — 12.5px / 500, secondary ink.
- Divider: `padding-left: 18px; border-left: 1px solid <hairline>`, then the user chip: 26px circle striped-placeholder avatar with 9.5px/600 initials in secondary ink → name "Jackson Reed" 12.5px/500 primary ink → "▾" 11.5px tertiary ink, `gap: 9px`.

**Row 2 — tab row, 44px, bottom hairline, `padding: 0 24px`, `gap: 26px`:**

- "Overview", "Account", "Billing" — 12.5px, `line-height: 44px`.
- Active: weight 600, primary ink, `box-shadow: inset 0 -1px 0 <accent fill>`.
- Inactive: weight 500, secondary ink.

**Page header — `padding: 30px 24px 0`:**

- Title 22px / 700 / -.02em.
- Subtitle 13px / 1.5, secondary ink, `margin-top: 8px`.

---

### 1. Overview (`10a` dark / `11a` light)

**Purpose:** land, see what changed in each product, choose one and go. It does exactly one job — the launcher. Account and billing live on their own tabs. (An earlier version stacked launcher + account + billing on one screen and was rejected as too crowded; keep this discipline.)

Header copy: "Good morning, Jackson" / "Monday, Sep 15 · 7 new outliers and 12 failing assets since you last looked".

#### Product cards — `display: grid; grid-template-columns: 1fr 1fr; gap: 14px`, `padding: 22px 24px 0`

Each card: card ground, hairline border, 10px radius, `padding: 26px 28px 24px`, `display: flex; flex-direction: column; gap: 22px`.

Contents top to bottom:

1. Eyebrow — "CREATOR RESEARCH" / "AD ANALYSIS", `margin-bottom: 14px`.
2. Product name — 22px / 700 / -.02em, primary ink.
3. Description — 13px / 1.5, secondary ink, `margin-top: 11px`, `max-width: 40ch`, `text-wrap: pretty`.
   - Outlier: "Tracks a watchlist of creators and scores every post against that creator's own median. Surfaces the hooks worth repurposing."
   - Signal: "Scores ad creative against a fixed criteria set per format, and flags every check a given asset fails."
4. `flex: 1` spacer — pushes the stats and actions to the bottom so both cards align regardless of description length.
5. **Stat strip** — three equal cells in a `gap: 1px` divider stack, hairline border, 10px radius, `overflow: hidden`. Each cell: card ground, `padding: 15px 16px`, eyebrow (`margin-bottom: 10px`) over a 20px/700/-.03em tabular number.
   - Outlier: CREATORS `18` · NEW OUTLIERS `7` · BEST 24H `6.4×`
   - Signal: ASSETS `87` · FAILING `12` (coral accent-text ink — it's a failed-check count) · LAST RUN `2h`
6. **Actions** — `display: flex; align-items: center; gap: 9px`:
   - Primary: "Open Outlier" / "Open Signal" — accent fill, white ink, 12.5px/600, `padding: 11px 15px`, 8px radius.
   - Secondary: "Watchlist" / "Upload asset" — transparent, hairline border, primary ink, 12.5px/500, `padding: 11px 14px`, 8px radius.
   - Flex spacer, then status meta 11.5px tertiary ink: "3 jobs running" / "Idle".

#### Plan + usage strip — `margin: 14px 24px 30px`

One card, `padding: 18px 22px`, `display: flex; align-items: center; gap: 22px`:

- Plan block: eyebrow "STUDIO PLAN" (`margin-bottom: 10px`) over "$79 / month · renews Oct 1" (12.5px/500, primary ink, nowrap).
- Vertical hairline divider: `width: 1px; height: 52px; flex: none`.
- Four usage items, each `flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 7px`:
  - Short label — 11.5px/400 secondary ink, `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`.
  - Value — 12.5px/500 primary ink, tabular nums, nowrap.
  - Progress track — `height: 3px`, hairline-coloured, 20px radius, `overflow: hidden`, `margin-top: 2px`, with an accent-fill bar at the given width.
  - **Stack label over value — do not put them on one line.** At four-up across ~640px each item is ~155px, and a side-by-side nowrap label + value overflows and collides. Short labels here ("Posts pulled", "Transcription"); the full labels are used on the Billing tab where there's room.
- Vertical hairline divider.
- "Manage plan" — transparent, hairline border, primary ink, 12.5px/500, `padding: 10px 14px`, 8px radius, `flex: none`.

---

### 2. Billing (`10b` dark / `11b` light)

**Purpose:** everything money, given room.

Header copy: "Billing" / "Studio plan · next charge $79.00 on Oct 1, 2026".

Body: `display: grid; grid-template-columns: 1fr 372px; gap: 14px`, `padding: 22px 24px 30px`. Both columns are `flex-direction: column; gap: 14px`.

#### Left column

**Usage this period** — card, `padding: 20px 22px 22px`.
- Header row: eyebrow "USAGE THIS PERIOD", flex spacer, "Sep 1 – Sep 30" (11.5px tertiary ink). `margin-bottom: 18px`.
- `display: grid; grid-template-columns: 1fr 1fr; gap: 20px 26px`. Each item:
  - Label (12.5px/500 primary) + flex spacer + value (12.5px/500 primary, tabular nums) on one line — full labels are fine at this width.
  - Progress track `height: 4px`, `margin: 10px 0 8px`, accent bar.
  - Sub-line 11.5px tertiary ink.

**Invoices** — card, `padding: 20px 22px 22px`.
- Header row: eyebrow "INVOICES", flex spacer, "Download all" (11.5px/500 accent text).
- Table as a `gap: 1px` divider stack, hairline border, 10px radius, `overflow: hidden`:
  - Header row on the **table-header ground**, `padding: 11px 16px`, four eyebrow-styled cells in tertiary ink: DATE · PERIOD · AMOUNT · PDF (right-aligned).
  - Body rows on card ground, `padding: 13px 16px`, `grid-template-columns: 1fr 130px 90px 60px; gap: 14px`: date (12.5px/500 primary), period (11.5px secondary), amount (12.5px/500 primary, tabular nums), "↓" (11.5px/500 accent text, right-aligned).

#### Right column

**Current plan** — the one tinted panel on the screen: accent tint bg, accent tint border, 10px radius, `padding: 20px 22px 22px`. All ink inside is the tint ink (`#d3e6ff` dark / `#0b2a52` light) — do not use page ink on a tint panel.
- Eyebrow "CURRENT PLAN" in tint ink, `margin-bottom: 14px`.
- "Studio" 22px/700/-.02em (white on dark, `#0b2a52` on light) + "$79 / month" 12.5px/500 tint ink, baseline-aligned, `gap: 8px`.
- Body 13px/1.5 tint ink, `margin-top: 11px`: "Both products, 25 creators, 5,000 posts and 150 ad analyses a month."
- Actions `margin-top: 17px; gap: 8px`: "Change plan" (accent fill, white ink) and "Cancel" (transparent, accent tint border, tint ink). Both `padding: 10px 14px`, 8px radius.

**Payment method** — card, `padding: 20px 22px 22px`. Eyebrow, `margin-bottom: 15px`. Row `gap: 13px`: 40×26px striped placeholder with hairline border and 5px radius → "Visa ending 4429" (12.5px/500) over "Expires 03 / 28" (11.5px tertiary, `margin-top: 6px`) → "Update" (11.5px/500 accent text, nowrap).

**Billing details** — card, `padding: 20px 22px 22px`. Eyebrow, `margin-bottom: 15px`. Three rows, `gap: 12px`, each a flex row with a fixed `width: 96px; flex: none` label (12.5px/400 secondary) and a value (12.5px/500 primary): Billed to `Jackson Reed` · Email `jackson@creoslabs.co` · VAT `Not provided`.

---

## Interactions & behaviour

The prototype is static except where noted. Intended behaviour:

- **Tabs** — client-side route per tab (`/workspace`, `/workspace/account`, `/workspace/billing`). Active tab carries the inset accent underline.
- **Product cards** — "Open Outlier" / "Open Signal" navigate into each product. The secondary button deep-links ("Watchlist" → Outlier's creators list; "Upload asset" → Signal's upload). The card body is not currently clickable; making the whole card a target is a reasonable improvement if you keep the two buttons distinct.
- **Hover** — rows in divider stacks lift by one ground step (dark: toward `#131316`; light: toward `#f7f6f3`). Ghost buttons move their border from the hairline to primary ink. Accent-text links darken one step (light: `#0857c4`).
- **Usage bars** — width is `used / limit` clamped to 100%. At ≥90% the bar and value should switch to coral (a limit you're about to hit is a failed check); the design doesn't show this state, so treat it as a spec, not a mock.
- **Invoices** — "↓" downloads that PDF; "Download all" zips the period. Rows are otherwise inert.
- **Cancel plan** — destructive, must confirm. Coral is the correct hue for the confirm action.
- **Loading** — no spinners over populated regions; render the card chrome and eyebrow immediately with the value area blank, and never show a computed number you don't have (see "every number is falsifiable").
- **Empty states** — omit rather than dim. No invoices yet → the invoices card shows a single row of secondary-ink text, not a greyed table. A product the account doesn't have → don't render the card; render an upsell in its place.
- **Responsive** — the design is fixed at 1180px. Below ~1000px the two product cards stack; the billing grid drops to one column; the usage strip wraps to two-up (give each item a `min-width` of ~140px). Above 1180px, cap the content and centre it.

## State management

Small — this is a read-mostly account shell.

- `activeTab: 'overview' | 'account' | 'billing'` (from the route).
- `user: { name, initials, email }`.
- `products: [{ key: 'outlier' | 'signal', stats: {…}, status: string }]` — per-product headline numbers and job status. Outlier's "3 jobs running" comes from the same job queue the product's own Progress screen reads; poll it or subscribe.
- `subscription: { plan, price, renewsOn, periodStart, periodEnd }`.
- `usage: [{ key, label, shortLabel, used, limit, sub }]` — one source of truth, rendered twice (short labels in the Overview strip, full labels on Billing).
- `paymentMethod: { brand, last4, expMonth, expYear }`.
- `invoices: [{ id, date, periodLabel, amount, pdfUrl }]`.

Billing data should come from the payment provider (Stripe or similar) rather than being mirrored in your own tables — invoices, payment method and next-charge date especially.

## Design tokens

Every token is in the **Design system** section above: grounds, ink, hairlines, accent and warn per theme, the type scale, and geometry. Implement them as theme variables with dark as the default — the light values are not derived from the dark ones by inversion, so both sets need to exist explicitly. Spacing is not a formal scale; the values used are 1, 7, 8, 9, 10, 11, 13, 14, 16, 18, 20, 22, 24, 26, 30px.

## Assets

None. Every image in the design is a **striped CSS placeholder** — avatars (26px circles with text initials) and the credit-card thumbnail (40×26px). Replace with real avatars and a card-brand mark; keep the striped gradient as the fallback for both.

Icons: the prototype uses text characters — "▾" (menu), "›" (row affordance), "↓" (download). Substitute your icon set at the same optical size; don't ship the glyphs.

## Files

- `Creos Labs Workspace.dc.html` — the design board. Four screens, each a fixed-width card:
  - `11a` Overview — light
  - `11b` Billing — light
  - `10a` Overview — dark (canonical)
  - `10b` Billing — dark (canonical)

  Open it in a browser. The board pans and zooms; each screen carries its id badge in the caption above it. Ignore the board chrome (see "About the design files").

- `support.js` — runtime the HTML board needs to render. Not part of the design; don't port it.

- `screens/` — 2× PNG renders of each screen, for reference when you can't run the HTML:
  - `10a-overview-dark.png`
  - `10b-billing-dark.png`
  - `11a-overview-light.png`
  - `11b-billing-light.png`

  The HTML is the source of truth for measurements — use the PNGs to check your result against the intended look.

## Not in this handoff

- **The Account tab** — designed shell and tab only. Build it on Billing's pattern: a left column of `gap: 1px` row stacks (profile, email, password, notifications) with a right column of narrow cards (connected platforms, danger zone). Ask before inventing the content.
- **The two products' own screens.** Outlier's Feed, Video detail, Creators and Progress screens were designed on the same Signal system in earlier rounds and are not in this bundle. If you're building those too, ask for that handoff separately — do not infer them from the workspace.
- **Auth, onboarding, plan-selection and checkout flows.**
