"""
Builds src/fonts/vazirmatn-fd-*.woff2 ("FaNum" Vazirmatn) from @fontsource/vazirmatn.

Keeps only the Persian/Arabic script (plus space and ZWNJ) and maps the Latin
digits 0–9 to the Persian digit glyphs ۰–۹, so any number rendered anywhere in
the UI reads in Persian while Latin letters fall through to Geist / Barlow.
Vazirmatn is SIL OFL 1.1 with no Reserved Font Name (see vazirmatn-OFL.txt).

    pip install fonttools brotli && python3 scripts/build-fanum-font.py
"""
from fontTools import subset
from fontTools.ttLib import TTFont

SRC = "node_modules/@fontsource/vazirmatn/files/vazirmatn-arabic-{w}-normal.woff2"
OUT = "src/fonts/vazirmatn-fd-{w}.woff2"

def keep(c: int) -> bool:
    return (0x600 <= c <= 0x6FF or 0x750 <= c <= 0x77F or 0xFB50 <= c <= 0xFDFF
            or 0xFE70 <= c <= 0xFEFF or c in (0x20, 0xA0, 0x200C, 0x200D, 0x200E, 0x200F))

for w in (400, 500, 600, 700, 800):
    font = TTFont(SRC.format(w=w))
    opts = subset.Options()
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=[c for c in font.getBestCmap() if keep(c)])
    sub.subset(font)
    for table in font["cmap"].tables:
        if table.isUnicode():
            for i in range(10):
                glyph = table.cmap.get(0x6F0 + i)
                if glyph:
                    table.cmap[0x30 + i] = glyph
    font.flavor = "woff2"
    font.save(OUT.format(w=w))
    print(OUT.format(w=w))
