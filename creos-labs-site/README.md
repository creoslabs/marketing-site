# Creos Labs website: design handoff

Static HTML mockups of the new Creos Labs site. Each file is self-contained, with all styles inline and no external dependencies. Treat them as the visual source of truth and rebuild them as real components in the existing site stack.

## What's included

| File | Page | Live URL it replaces |
|---|---|---|
| `desktop/homepage.html` | Homepage, desktop | creos-labs.com |
| `mobile/homepage.html` | Homepage, mobile (390px) | creos-labs.com |
| `desktop/outlier.html` | Outlier product page, desktop | outlier.creos-labs.com |
| `mobile/outlier.html` | Outlier product page, mobile (390px) | outlier.creos-labs.com |
| `desktop/signal.html` | Signal product page, desktop | signal.creos-labs.com |
| `mobile/signal.html` | Signal product page, mobile (390px) | signal.creos-labs.com |

The desktop files use a fluid layout (max-width 1280px container, flex-wrap). The mobile files are fixed 390px reference designs. **Build each page as one responsive page**: use the desktop file for wide screens and the mobile file as the spec for small screens. Do not ship two separate pages.

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

- **Logo:** the approved lockup is the split-asterisk symbol plus the "CREOS LABS®" wordmark. Don't use a "CREOS LABS*" version anywhere.
- **Asterisk SVG:** six arms. The top three arms are paper `#F2F0EA` and the bottom three are accent `#FFD60A`. **On any light or white background, the whole asterisk is ink `#0B0B0A`.** Make it one component with a `light` prop.
- **Product lockups:** "CREOS LABS® / OUTLIER" and "CREOS LABS® / SIGNAL". The product name is the same colour as the wordmark, not yellow.
- **Menu items** are always uppercase.
- **Emoji:** real Unicode emoji, set with `font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"`. They render as Apple emoji on Apple devices and as the system set elsewhere. People emoji usually sit in paper-coloured circles.

## Implementation notes

- **Homepage hero:** the "everything in" orbit (eight input chips pulling into the asterisk) is absolutely positioned at a fixed 560×520. Below about 600px wide, swap it for the mobile constellation version from `mobile/homepage.html` (emoji dots only, plus a caption).
- **Shared components:** nav, footer, asterisk, buttons, pills, emoji avatar, the dark product card, the "journey" track (one asset moving through four stages) and the FAQ accordion are repeated across pages. Build them once.
- **FAQ:** uses native `<details>`/`<summary>`. Keep it accessible.
- **Sample data:** all numbers in the UI mockups (41×, 12.6M, 82/100, the feed and round tables) are illustrative and come from the live pages. Keep the "Sample data." and "Illustrative example." labels.
- **Placeholders to fill:** the three service prices on the homepage say `From [PRICE]`.
- **Links to wire up:** in-page anchors (`#pricing`, `#how`, `#faq` and so on) work as they are. These still need real destinations: `#enquire` (contact or enquiry flow), `#get` (Creos checkout), `#signal` and `#outlier` on the homepage (point them to the subdomains), and the product "Log in" links (currently `https://<product>.creos-labs.com/login`).
- **Pricing:** A$15/month founding access, which includes Outlier, Signal and the upcoming "???" product.
