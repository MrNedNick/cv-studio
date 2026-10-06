"""Rebuild checked-in PDF core fonts with fontTools 4.60.2; normal builds use the saved files."""
from pathlib import Path
import json
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
directory = root / "public" / "fonts"
ranges = [(0x20, 0x24F), (0x300, 0x52F), (0x1C80, 0x1C8F),
          (0x2000, 0x206F), (0x20A0, 0x20CF), (0x2116, 0x2116),
          (0x2122, 0x2122), (0x2212, 0x2212), (0xFEFF, 0xFEFF), (0xFFFD, 0xFFFD)]
requested = {value for start, end in ranges for value in range(start, end + 1)}
coverage = requested.copy()
for family in ["NotoSans", "NotoSerif"]:
    for weight in ["Regular", "Bold"]:
        source = directory / f"{family}-{weight}.ttf"
        target = directory / f"{family}-{weight}-core.ttf"
        font = TTFont(source, recalcTimestamp=False)
        original = font.getBestCmap()
        metrics = {point: font["hmtx"].metrics[glyph] for point, glyph in original.items()}
        options = subset.Options()
        options.layout_features = ["*"]
        options.name_IDs = ["*"]
        options.recalc_timestamp = False
        worker = subset.Subsetter(options=options)
        worker.populate(unicodes=requested)
        worker.subset(font)
        font.save(target)
        result = TTFont(target)
        current = result.getBestCmap()
        assert set(current) == set(original) & requested
        assert all(result["hmtx"].metrics[glyph] == metrics[point] for point, glyph in current.items())
        coverage &= set(current)
        print(f"{target.name}: {source.stat().st_size:,} -> {target.stat().st_size:,} bytes")

# Whitespace controls are layout separators rather than drawn glyphs.
coverage |= {9, 10, 13}
compressed = []
for point in sorted(coverage):
    if compressed and compressed[-1][1] == point - 1:
        compressed[-1][1] = point
    else:
        compressed.append([point, point])
(root / "src" / "pdf-font-coverage.ts").write_text(
    "// Core coverage shared by all four PDF fonts. Rebuild with scripts/subset-pdf-fonts.py.\n"
    "export const pdfCoreCoverage: readonly (readonly [number, number])[] = " + json.dumps(compressed) + "\n",
    encoding="utf-8",
)
