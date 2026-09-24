# Signal report template — handoff for Claude Code

This is the design from the "Signal — Best-Practice Report Template" artifact,
extracted into a **data-driven, code-renderable template** instead of a static
canvas design. Hand this whole folder to Claude Code (or any engineer) and ask
it to wire it into Signal's report-generation pipeline — it's a working
reference, not just a spec.

## What's in here

- **`signal_report.html.j2`** — the report layout as a single Jinja2 template.
  One structure serves both light and dark mode; which one you get depends
  entirely on which theme dict you pass in.
- **`themes.json`** — the light and dark color/token sets (backgrounds, ink
  colors, status colors, shadows, etc.), pulled directly from the two
  artboards pixel-for-pixel. Swap these to re-theme without touching the
  template.
- **`example_data.json`** — the exact content from the original `video_1.mp4`
  report (score 50/100, all 16 criteria, all 7 timestamped findings, the top
  fix), shaped into the data contract the template expects. This is both a
  live example and the documentation of the schema — see below.
- **`render_report.py`** — a working reference pipeline: loads JSON data +
  a theme name, renders the Jinja2 template to HTML, then prints that HTML to
  a PDF with headless Chromium (via Playwright). Run it as-is to confirm the
  template works, then adapt the "load data" step to pull from Signal's real
  scoring output instead of a fixture file.

## Quick start

```bash
pip install jinja2 playwright
playwright install chromium

python render_report.py example_data.json light out/report-light.pdf
python render_report.py example_data.json dark  out/report-dark.pdf
```

Each run also writes a `.html` file next to the PDF so you can open it in a
regular browser and iterate on layout without waiting on a PDF render.

## What Claude Code needs to actually build

The template and renderer already work end-to-end for the one example video.
The real task is a small adapter: **map Signal's internal scoring result for
a given video onto the JSON shape in `example_data.json`**, then call
`render_report.py` (or inline its two functions) as the last step of a scoring
run. Concretely:

1. Wherever Signal finishes scoring a video and has the per-criterion
   pass/partial/fail verdicts, the overall score, and the timestamped
   findings, build a dict matching `example_data.json`'s shape.
2. Decide light vs. dark (a user setting, a flag, or just always emit both —
   they're cheap to render).
3. Call `render_html()` + `html_to_pdf()` from `render_report.py`, or lift
   that logic into wherever the pipeline currently does the "make a report"
   step.
4. Delete the old report generator once this replaces it.

## The data contract

Top-level fields the template expects:

- `accent` — hex color for the brand accent (defaults to `#2997ff` if
  omitted). This is the one lever a user could plausibly customize per
  report; everything else in `themes.json` is fixed design system, not data.
- `product_name` — defaults to `"Signal"` if omitted.
- `file` — `{name, format_tag, platform, date, aspect_label}`. `format_tag`
  is the free-text pill (`"VIDEO · 0:08 · 9:16"`); build it however the
  pipeline already formats duration/aspect.
- `score` — `{value, pass_count, partial_count, fail_count, median,
  percentile_label}`. `value` and `median` are 0–100. `percentile_label` is
  a full sentence fragment (e.g. `"0th percentile among videos in this
  set"`) rather than a bare number, since the original report phrased it
  that way.
- `tier1` / `tier2` — each `{label, rows: [...]}`. A row is
  `{name, status, detail}` where `status` is one of `"pass" | "partial" |
  "fail"`. A row can optionally carry a `panel` (see below) rendered directly
  underneath it — used here for the safe-zone map after the "Safe-zone
  overlap" criterion, but generic enough for any criterion that benefits from
  a supporting diagram.
- `findings_timeline` — the dots above the findings cards. Each entry is
  `{timestamp, position, status, row}`. `position` is 0–100 (percent along
  the timeline). `row` is `0` or `1` — the design alternates findings between
  a row above and a row below the divider line so adjacent timestamp labels
  don't collide; when generating this from real data, a simple heuristic
  (alternate by index, or push to the other row only when two timestamps
  would land within ~8% of each other) reproduces this.
- `findings` — the cards below the timeline: `{timestamp, tier, title,
  detail}`, in chronological order.
- `top_fix` — `{headline, body, checklist}`, where `checklist` is a list of
  plain strings (criterion names this fix would resolve).

### The `panel` sub-schema (safe-zone map)

```json
{
  "caption": "Safe-zone map · where the on-screen text lands",
  "frames": [
    { "timestamp": "0:01–0:04", "bands": [
      { "top": 0, "height": 33, "tone": "info", "bordered": true, "label": "Headline" },
      { "top": 75, "height": 9, "tone": "danger", "strong": true, "label": "Disclaimer" }
    ]}
  ],
  "legend": [{ "tone": "info", "label": "On-screen text" }],
  "note": "One sentence tying the diagram back to the finding."
}
```

`top`/`height` are percentages of the 9:16 frame's height. `tone` is
`"info"` (blue, on-screen text), `"danger"` (red, a problem area) or
`"hatch"` (diagonal-striped red, an exclusion zone). This only needs to be
populated for criteria where a visual actually helps — most rows have no
`panel` at all.

## Design rules worth keeping in the generator

- **Never fabricate.** Every number, timestamp, and sentence in this report
  came from the original Signal analysis of `video_1.mp4` — nothing was
  invented for the design pass. Keep that discipline in the real pipeline:
  if a field is genuinely unavailable for some video, leave the section out
  rather than guessing.
- **The two "ink" families matter.** Each theme defines `accent_ink` /
  `warn_ink` / `danger_ink` (readable status colors for text/pills) that are
  deliberately different from `legend_pass` / `legend_partial` /
  `legend_fail` (bolder colors reserved for chunky UI like the distribution
  bar and legend dots, mainly relevant in dark mode where the raw brand
  colors are too intense for small text). Don't collapse these — it's the
  difference between "accessible" and "looks washed out" vs. "looks like a
  toy."
- **Print sizing.** The layout is fixed at 816px wide (US Letter at 96 DPI)
  with 72px of padding standing in for the print margin. `render_report.py`
  already passes `width="816px"` and `prefer_css_page_size: true` to
  Playwright's PDF export — keep those if you swap the PDF engine.

## Brand reference (creos-labs.com)

If this ever needs to extend beyond Signal's report to other Creos Labs
surfaces, the source tokens are: pure black `#000000` background, off-white
`#F5F5F7` text, accent blue `#2997FF`, `'Helvetica Neue', Helvetica, Arial`
font stack, wide-tracked (~0.2em) uppercase eyebrow labels, and pill badges
with a subtle background/border plus a small dot indicator.
