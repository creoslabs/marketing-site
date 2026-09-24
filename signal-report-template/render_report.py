#!/usr/bin/env python3
"""
Render a Signal best-practice report from data + a theme into a PDF.

Usage:
    python render_report.py example_data.json light out/report-light.pdf
    python render_report.py example_data.json dark  out/report-dark.pdf

This is a *reference* implementation, not production code: it shows the
whole path from (report data) + (theme tokens) -> (templated HTML) ->
(printed PDF) using Jinja2 + Playwright's headless Chromium, both of which
are already dependencies here. A real pipeline would call this right after
Signal finishes scoring a video, with `data` built from the scoring result
instead of loaded from a fixture file.

Install (if not already present):
    pip install jinja2 playwright
    playwright install chromium
"""

import json
import sys
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent


def render_html(data_path: str, theme_name: str) -> str:
    data = json.loads(Path(data_path).read_text())
    themes = json.loads((HERE / "themes.json").read_text())

    if theme_name not in themes:
        raise SystemExit(f"Unknown theme '{theme_name}'. Choose one of: {list(themes)}")

    env = Environment(loader=FileSystemLoader(str(HERE)))
    template = env.get_template("signal_report.html.j2")

    return template.render(theme=themes[theme_name], **data)


def html_to_pdf(html: str, out_path: str) -> None:
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(html, wait_until="networkidle")
        page.pdf(
            path=out_path,
            width="816px",
            print_background=True,
            prefer_css_page_size=True,
        )
        browser.close()


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        raise SystemExit(1)

    data_path, theme_name, out_path = sys.argv[1:4]
    html = render_html(data_path, theme_name)

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)

    # Handy for debugging in a browser before committing to a PDF render.
    debug_html_path = str(Path(out_path).with_suffix(".html"))
    Path(debug_html_path).write_text(html)

    html_to_pdf(html, out_path)
    print(f"Wrote {out_path} (and {debug_html_path} for quick inspection)")


if __name__ == "__main__":
    main()
