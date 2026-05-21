#!/usr/bin/env python3
"""Bake Gmarket Sans text into SVG paths for consistent icon rendering."""

from __future__ import annotations

from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parents[1]
FONT_PATH = ROOT / "public/fonts/GmarketSansTTFBold.ttf"
FONT_PX = 10.5

SVG_TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="하이록스 맵">
  <rect width="64" height="64" rx="14" fill="#18181b"/>
  <circle cx="32" cy="33" r="19" fill="#000"/>
{paths}
</svg>
"""


def render_paths() -> str:
    font = TTFont(FONT_PATH)
    upem = font["head"].unitsPerEm
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = FONT_PX / upem

    def glyph(ch: str) -> tuple[str, float]:
        name = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[name].draw(pen)
        return pen.getCommands(), font["hmtx"][name][0]

    def line(text: str, baseline_y: float) -> list[str]:
        total = sum(glyph(ch)[1] for ch in text)
        x = 32 - (total * scale) / 2
        out: list[str] = []
        for ch in text:
            d, w = glyph(ch)
            out.append(
                f'  <path fill="#fff" d="{d}" '
                f'transform="translate({x:.3f} {baseline_y:.3f}) '
                f'scale({scale:.6f} {-scale:.6f})"/>'
            )
            x += w * scale
        return out

    lines = line("ㅎㅇ", 29.5) + line("ㄹㅅ", 39.5)
    return "\n".join(lines)


def main() -> None:
    paths = render_paths()
    svg = SVG_TEMPLATE.format(paths=paths)

    targets = [
        ROOT / "public/icons/icon-wallball.svg",
        ROOT / "src/app/icon.svg",
        ROOT / "src/app/apple-icon.svg",
    ]
    for target in targets:
        target.write_text(svg, encoding="utf-8")
        print(f"wrote {target.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
