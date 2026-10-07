# Creos Labs — screen inventory for redesign

Captured 2026-10-07 from the current build. Desktop = 1440px wide, mobile = 390px wide, both full-page at 2x.

## PDFs (for uploading to a Claude chat — 4 files)

In `pdf/`. One screen per page, desktop and mobile side by side, with the route and "new / old style" noted on each page.

- creos-labs-1-public-pages.pdf — 9 pages
- creos-labs-2-workspace-private.pdf — 3 pages
- creos-labs-3-outlier-app-private.pdf — 9 pages
- creos-labs-4-signal-app-private.pdf — 5 pages

## Captured (public, no login needed)

| # | Screen | Route | Desktop | Mobile | Status |
|---|--------|-------|---------|--------|--------|
| 01 | Homepage | `/` | 01-home-desktop.png | 01-home-mobile.png | New design |
| 02 | Outlier product page | `/products/outlier` (outlier.creos-labs.com) | 02-outlier-landing-desktop.png | 02-outlier-landing-mobile.png | New design |
| 03 | Signal product page | `/products/signal` (signal.creos-labs.com) | 03-signal-landing-desktop.png | 03-signal-landing-mobile.png | New design |
| 04 | Log in | `/login` | 04-login-desktop.png | 04-login-mobile.png | Old style |
| 05 | About | `/about` | 05-about-desktop.png | 05-about-mobile.png | Old style |
| 06 | Insights (placeholder) | `/insights` | 06-insights-desktop.png | 06-insights-mobile.png | Old style |
| 07 | 404 | any unknown URL | 07-not-found-404-desktop.png | 07-not-found-404-mobile.png | Old style |

States and flows:

- 08-home-mobile-menu-open.png — homepage, mobile menu open
- 09-signal-mobile-menu-open.png — product page, mobile menu open
- 10-flow-get-creos-1-pricing-card.png → 10-flow-get-creos-2-submitted.png — "Get Creos" email signup: before and after submitting (the same card is on both product pages)

## Captured while signed in — `private/` folder

Captured from the live production site (www / outlier. / signal.creos-labs.com). **These contain real account data — redact before sharing.** Each has `-desktop.png` and `-mobile.png`.

Workspace
- 01-workspace-home — `/workspace` (`/dashboard` redirects here, so it has no separate screen)
- 02-workspace-account — `/workspace/account`
- 03-workspace-billing — `/workspace/billing`

Outlier app
- 10-outlier-dashboard — home
- 11-outlier-creators — creators list
- 12-outlier-creator-detail — one creator
- 13-outlier-feed — ranked post feed
- 14-outlier-post-detail — one post (score, caption, structure, transcript)
- 15-outlier-tag — posts for one tag
- 16-outlier-favourites — saved posts (empty state)
- 17-outlier-trends
- 18-outlier-progress

Signal app
- 20-signal-library — asset library
- 21-signal-analyze — upload an asset
- 22-signal-benchmarks
- 23-signal-compare
- 24-signal-report — one analysis report

## Still not captured

- Outlier repurpose result (`/outlier/repurpose/[id]`) and the public share page (`/share/repurpose/[id]`): no repurpose exists on the account, and generating one runs a paid AI job.
- Overlays and transient UI inside the apps: onboarding checklist, notification bell, command palette (⌘K), toasts, confirm dialogs, the product switcher dropdown and the Add creator / Analyze flows.

Known issue visible in 14-outlier-post-detail: the post thumbnail fails to load and shows the caption text in its place.
