# Handoff: Creos Labs — account workspace

## Overview

Creos Labs is one subscription covering several marketing tools. **Outlier** (content intelligence) tracks creators and scores every post against that creator's own running median. **Signal** (creative analysis) scores ad creative against format criteria before launch. A third slot, "???", is a placeholder for the next tool.

This handoff is the **account workspace above both products** — where a logged-in user lands. Three tabs, each in dark (canonical) and light:

| Tab | Board ids | Purpose |
| --- | --- | --- |
| Overview | `12a` dark, `12c` light | Pick a product; each card shows live proof of what changed |
| Billing | `12b` dark, `12d` light | Founding-access plan, what's included, payment, invoices |
| Account | `12e` dark, `12f` light | Profile, security, connected accounts, notifications, delete |

## About the design files

`Creos Labs Workspace.dc.html` is a **design reference in HTML**, not production code. Recreate it in the target codebase's existing framework, component library and styling approach. If none exists, pick an appropriate stack.

It is a zoomable design board. **Ignore the board chrome** — `.dv-turn`, `.dv-thd`, `.dv-opts`, `.dv-opt`, `.dv-olabel`, `.dv-oid`, `.dv-next`, `.dv-card`'s outer frame and the `<helmet>` block. Only the content inside each `.dv-card` is the design. Inline styles and a trailing logic class are prototype constraints — use your normal styling and componentise repetition. `support.js` is the board's runtime; don't port it.

## Fidelity

**High-fidelity.** Colours, type, spacing and radii are final. Copy is final except where marked as placeholder data.

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
| Wordmark | "CREOS LABS" 13px / 700 / .14em, `®` at 8px superscript |

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

## Shell (all tabs), 1180px design width

**Chrome** — 58px, page ground, bottom hairline, `padding: 0 28px`, `gap: 30px`:
- Wordmark "CREOS LABS®" — white on dark, `#111` on light.
- Tabs Overview · Account · Billing, 12.5px, `line-height: 58px`, `gap: 24px`. Active: 600, primary ink, `box-shadow: inset 0 -1px 0 <accent fill>`. Inactive: 500, secondary ink.
- Spacer, then "Insights ↗" and "Support" (12.5px/500 secondary ink).
- User chip after a `border-left` hairline with `padding-left: 20px`: 26px striped avatar with initials, name 12.5px/500.

**Hero** — `padding: 52px 28px 0`: eyebrow (`margin-bottom: 22px`, slash-separated: "Workspace / Monday 15 Sep"), two-line headline, then body 13px secondary ink, `max-width: 56ch`, `margin-top: 18px`.

| Tab | Eyebrow | Line 1 | Line 2 (grey) | Sub |
| --- | --- | --- | --- | --- |
| Overview | Workspace / {weekday date} | Morning, {first name}. | Here's what moved. | One-sentence summary of the biggest change in each product |
| Billing | Billing / Founding access | One subscription. | Every tool. | Next charge A$15.00 on {date}. No lock-in — cancel anytime. |
| Account | Account / {full name} | Your account. | Across every tool. | One login for Outlier, Signal and whatever comes out of the lab next. |

---

## 1. Overview (`12a` / `12c`)

**Product cards** — `grid-template-columns: 1fr 1fr; gap: 14px`, `padding: 36px 28px 0`. Each card: card ground, hairline, 10px, `padding: 26px 28px 24px`, `flex-direction: column; gap: 24px`.

1. Top row: eyebrow "01 / Content intelligence" or "02 / Creative analysis"; spacer; status meta ("7 new since yesterday" / "Top 10% of your 25").
2. Name + score row (`align-items: flex-end`): left, product name + one-line description of the headline item; right, display score + tertiary eyebrow beneath ("Instagram · 62 posts" / "9:16 video · 3 criteria").
3. **Visualisation, fixed height 104px, bottom-aligned** — this keeps both cards uniform:
   - Outlier: 18 bars, `gap: 3px`, 74px tall area, a 1px tertiary line marking the running median, the last three bars in accent fill. Meta row: "Running median 188K" / "72 h after posting".
   - Signal: beat strip as a `gap: 1px` stack — Problem 0–3 s (flex 2), Demonstration 3–9 s (flex 4), Proof 9–15 s (flex 4), each on the subtle fill. Meta row: "2 pass" (accent text) · "1 partial" (secondary ink) · spacer · "Face enters at 0.8 s".
4. Actions, `margin-top: auto`, `padding-top: 20px`, top hairline: primary "Open Outlier ↗" / "Open Signal ↗" plus ghost "Watchlist" / "Upload creative".

**Second row** — two shorter cards, same grid, `padding: 14px 28px 0`, `padding: 22px 28px` inside:
- "03 / In the lab" — "Something new is forming. It'll be included in your subscription." with "???" at 28px/700 tertiary ink on the right.
- "Creos / Custom" — "Doing something by hand every week? We'll scope the tool that does it." plus "Talk to us ↗" (accent text).

**Footer strip** — top hairline, `margin: 36px 28px 0; padding: 18px 0 28px`: eyebrow "Founding access", "A$15 / month · renews 1 Oct", tertiary "Your founding price stays yours while you're subscribed.", spacer, "Billing ↗".

## 2. Billing (`12b` / `12d`)

`grid-template-columns: 1fr 380px; gap: 14px`, `padding: 36px 28px 0`.

**Plan panel (left)** — the screen's one tint panel. Accent tint bg + border, `padding: 26px 28px`, `gap: 22px`. **All ink inside uses tint ink**, never page ink.
- Eyebrow "Your plan"; "A$15" at display size with " / month" 20px; right-aligned body "Your founding price stays yours while you're subscribed."
- Included list as a `gap: 1px` stack over the tint border colour: Outlier · Content intelligence · INCLUDED; Signal · Creative analysis · INCLUDED; ??? · Something new is forming in the lab · INCLUDED.
- Actions: primary "Update payment", tint-bordered ghost "Cancel subscription".

**Right column** — Payment method card (40×26 striped card thumb, "Visa ending 4429", "Expires 03 / 28", "Update" link). Billing details card: Billed to · Email · ABN, label column 84px.

**Invoices** — full-width card below, `padding: 14px 28px 0`. Header row with eyebrow and "Download all ↓". Table as `gap: 1px` stack: header row on subtle fill (DATE · PERIOD · AMOUNT · PDF, tertiary eyebrow style), rows `grid-template-columns: 1fr 1fr 1fr 80px`, amount "A$15.00", "↓" in accent text right-aligned.

**Footer strip** — "Running Creos for multiple brands? We're working with selected teams and agencies." + "Talk to us ↗".

## 3. Account (`12e` / `12f`)

`padding: 36px 28px 0`. Five sections, each `grid-template-columns: 260px 1fr; gap: 28px; padding: 30px 0; border-top: hairline`. Left: eyebrow + tertiary 12.5px/1.5 explanation. Right: content.

Row pattern: `gap: 1px` stack; each row `padding: 15px 18px`, label (12.5px secondary, 140px fixed), value (12.5px/500 primary, flex 1), action link (11.5px/500 accent text).

| Section | Explanation | Rows |
| --- | --- | --- |
| Profile | Shown on shared exports and repurposed scripts. | 56px avatar + "Upload photo" ghost + "Remove"; then Name · Email · Time zone |
| Security | How you sign in. | Password (last changed) · Sign-in (Google) · Sessions ("Sign out others") |
| Connected accounts | Outlier pulls creator posts through these. Your own handles are used to benchmark your content. | Instagram · TikTok · Meta Ads, with Connect / Disconnect |
| Notifications | Email only. Nothing is sent that the tools couldn't compute. | Toggle rows: New outliers · Signal results · Failed pulls · Product news |
| Delete account | Removes your watchlist, scores, uploads and saved scripts. Cancel your subscription first. | Coral tint panel with coral-ink copy + coral "Delete account" button |

Toggle: 30×18px track, 20px radius, 2px padding, 14px white knob; on = accent fill, knob right; off = `rgba(255,255,255,.18)` dark / `rgba(0,0,0,.18)` light, knob left.

---

## Behaviour

- Tabs are routes: `/workspace`, `/workspace/billing`, `/workspace/account`.
- "Open …" enters each product; secondary buttons deep-link (Watchlist, Upload creative).
- Hover: rows lift one ground step; ghost borders go to primary ink; links darken one step.
- Toggles save immediately (optimistic, revert on error). No save button on Account.
- Edit / Change open inline editors or small dialogs; email change requires verification.
- Delete account and Cancel subscription require confirmation; confirm actions are coral.
- Loading: render card chrome and eyebrows immediately; never show a number you don't have.
- Empty: omit, don't dim. No invoices yet → a single secondary-ink line. Disconnected platform shows "Not connected" + Connect.
- Responsive: below ~1000px, two-up grids stack, Account sections go single-column (explanation above rows), Billing right column drops below the plan panel.

## Data

- `user { name, firstName, initials, email, timeZone, avatarUrl }`
- `products.outlier { newSinceYesterday, headline: { handle, caption, views, median, score, platform, postsPulled, barSeries[] } }`
- `products.signal { headline: { title, format, score, criteriaCount, beats[], pass, partial, note }, percentileAmongOwn, ownAssetCount }`
- `subscription { plan: 'Founding access', priceAud: 15, renewsOn, status }`
- `paymentMethod`, `invoices[]` — from the payment provider, not mirrored.
- `connections[] { platform, handle | null }`
- `notificationPrefs { newOutliers, signalResults, failedPulls, productNews }`

Placeholder data in the mock: user, handles, card details, dates, invoice history, scores.

## Files

- `Creos Labs Workspace.dc.html` — the board (six screens, ids `12a`–`12f`).
- `support.js` — board runtime only.
- `screens/` — 2× PNG renders of each screen for visual comparison. The HTML is the source of truth for measurements.

## Not in this handoff

- The Outlier and Signal product screens themselves.
- Auth, onboarding and checkout.
