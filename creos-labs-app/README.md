# Creos Labs signed-in apps: implementation brief

These are desktop designs (1440px wide) for every signed-in screen in the current build. Mobile isn't designed yet: keep the current responsive behaviour, restyled with the new tokens, until mobile mockups exist.

Open any file in a browser to see the screen. Each one is self-contained.

## Design tokens

| Token | Value | Use |
|---|---|---|
| Ink (background) | `#0B0B0A` | Page background, dark text on light |
| Paper | `#F2F0EA` | Light sections, cards, primary text on dark |
| White | `#FFFFFF` | Rows inside light cards |
| Accent | `#FFD60A` | One highlight phrase per headline, primary CTAs, "winner" states |
| Surface | `#151513` | Dark cards |
| Border dark | `#2A2925` / `#3A3934` | Card borders, dividers, outline pills |
| Muted on dark | `#B9B6AE` (body), `#9A978F` (labels) | Secondary text |
| Muted on light | `#46443F` (body), `#55534D` (labels) | Secondary text |
| Dot grid | `radial-gradient(#1F1E1B 1px, transparent 1px)` at 22px | Page background texture |

**Type:** Helvetica Neue throughout (`"Helvetica Neue", Helvetica, Arial, sans-serif`).
- `.disp`: weight 700, uppercase, letter-spacing −0.035em. Used for headlines and big numbers.
- `.mono`: weight 500, uppercase, letter-spacing 0.1em, 9–12px. Used for labels and eyebrows. (Despite the class name, it isn't a monospace font.)
- Body text: 15–20px, line-height 1.5.

**Shape:** pills and buttons are fully rounded (999px). Cards have 20–32px radius. Buttons are 54–56px tall.

## Brand rules

- **Logo:** the wordmark is "CREOS LABS", with no ®. There are two approved lockups: the split-asterisk symbol next to "CREOS LABS" (used everywhere in these mockups), and "CREOS LABS" with a small asterisk where the ® used to sit, for places where the symbol isn't shown alongside it.
- **Asterisk SVG:** six arms. The top three arms are paper `#F2F0EA` and the bottom three are accent `#FFD60A`. **On any light or white background, the whole asterisk is ink `#0B0B0A`.** Make it one component with a `light` prop.
- **Product lockups:** "CREOS LABS / OUTLIER" and "CREOS LABS / SIGNAL". The product name is the same colour as the wordmark, not yellow.
- **Menu items** are always uppercase.
- **Emoji:** real Unicode emoji, set with `font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"`. They render as Apple emoji on Apple devices and as the system set elsewhere. People emoji usually sit in paper-coloured circles.

## Screen → route map

| File | Route | Notes |
|---|---|---|
| `app/workspace/01-home.html` | `/workspace` (`/dashboard` redirects) | Overview across products |
| `app/workspace/02-account.html` | `/workspace/account` | **Connected accounts section removed on purpose** (see Decisions) |
| `app/workspace/03-billing.html` | `/workspace/billing` | |
| `app/outlier/01-home.html` | outlier `/app` | |
| `app/outlier/02-feed.html` | `/feed` | Paginated ("Show 20 more") instead of one long page |
| `app/outlier/03-post-detail.html` | `/video/[id]` | |
| `app/outlier/04-creators.html` | `/creators` | |
| `app/outlier/05-creator-detail.html` | `/creators/[id]` | |
| `app/outlier/06-trends.html` | `/trends` | |
| `app/outlier/07-tag.html` | `/tags/[tag]` | |
| `app/outlier/08-favourites-empty.html` | `/favourites` | Empty state; the filled state reuses the feed grid |
| `app/outlier/09-progress.html` | `/progress` | Shows the grouped-error state |
| `app/signal/01-library.html` | signal `/app` | |
| `app/signal/02-analyze.html` | `/analyze` | |
| `app/signal/03-report.html` | `/report/[id]` | |
| `app/signal/04-benchmarks.html` | `/benchmarks` | |
| `app/signal/05-compare.html` | `/compare` | **New page.** The route currently 404s. |

## Shared components to build once

| Component | Where it appears | Notes |
|---|---|---|
| App header | Every screen | Asterisk + "CREOS LABS", then "/ [product ▾]" switcher on product screens. Uppercase nav with a 2px accent underline on the active item. ⌘K search field, bell with unread dot, account button. Sticky. |
| Page header | Every screen | Accent eyebrow, two-line uppercase headline (second line `#5E5C56`), one-line summary, actions aligned right |
| Buttons | Everywhere | Pill, 40px (36px small). Variants: `primary` (accent), `paper`, `ghost` (outline), `ink` (on light cards), `danger` |
| Chips | Everywhere | Uppercase 10px labels. Variants: dark outline, soft, paper, accent, ink-on-accent, fail |
| Card | Everywhere | `#151513` surface, `#2A2925` border, 22px radius. Paper variant (`#F2F0EA`) with an inset 2px accent ring for the single most important card on a page |
| Media tile | Feed, home, library, report | Fixed 9:16 (or set height) tile with platform chip top-left, optional label top-right, and score badge bottom-left (accent when ≥ 2× or a "winner", paper otherwise). **On a failed image load, show the neutral tile, never the caption text** (fixes the current bug). |
| Post card | Outlier home, feed, creator, tag | Tile, then creator avatar + handle + date, caption clamped to 2 lines, then view, engagement and hook-style chips |
| Stats row | Outlier home, creator detail | One bordered strip split into cells; the key metric in accent |
| Status | Signal report, compare, benchmarks | ✅ Pass / ⚠️ Partial / ❌ Fail. Always emoji plus a text label, never colour alone. Fail uses `#FF7A59`. |
| Alert (error) | Workspace home, Outlier home, progress | Dark red surface `#1F1410` with border `#4A2A1F`. States the problem, what's safe, and the fix as buttons. |
| Switch | Account, feed filter | `role="switch"` with `aria-checked`; accent when on |
| Segmented control | Analyse, report | `role="radiogroup"`; selected option uses the paper fill |

## Decisions to keep (and why)

1. **Accent is the brand yellow `#FFD60A`, not blue.** Use it for primary actions, active nav, scores ≥ 2×, the single "winner" item, and the top-fix card. Don't use it for decoration.
2. **Errors are grouped by cause, not listed per job.** Progress shows one card for "Apify monthly usage limit reached", with the affected creators, "Update Apify token" and "Retry all", and the raw error behind a `<details>`. Group identical failures by error type.
3. **Paused state is surfaced where people look.** When pulls are failing, show a compact alert on Workspace home and Outlier home that links to Progress.
4. **Connected accounts removed from Account.** The product promise is "no account connection". Leave the section out unless that changes.
5. **Destructive actions are one step removed.** Remove a creator lives in a "⋯" menu, not as a button in every row.
6. **Signal report puts the top fix first** in the right column, above the timestamped findings. Findings and timeline segments jump the player to their timestamp.
7. **Video and static are never averaged together** (benchmarks and compare). Compare only shows criteria both assets share.
8. **Feed is paginated** ("Show 20 more", plus a count) instead of rendering all posts at once.
9. **One "New" announcement bar at a time**, dismissible, instead of stacked banners.

## Data notes

- Real data from the current account was used where the screenshots had it: handles, scores, medians, criteria names and results, and transcript lines.
- **Illustrative only:** everything on Compare (the second asset's results and the summary text), the hook-style breakdown on the creator page, how the 30 failed pulls split across creators, and the extra feed posts beyond the first four. Wire these to real data.
- Email addresses are shown as `[your email]`. Use the signed-in user's values.
- Emoji tiles stand in for real thumbnails and video frames.

## Not designed yet

Repurpose result (`/outlier/repurpose/[id]`) and its public share page, the onboarding checklist, notifications dropdown, ⌘K command palette, toasts, confirm dialogs, the product switcher dropdown, the Add creator and Analyse-in-progress flows, and all mobile layouts for the apps. For these, follow the patterns above until they're designed.

