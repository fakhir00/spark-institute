#!/usr/bin/env python3
"""Build the SPARK institute site (multi-page).

Assembles each page from partials + page body, inlines styles.css / script.js,
and replaces {{IMG:key}} tokens with base64 data URIs from assets-src/.
Writes <name>.html files at the repo root. Caches data URIs in
src/images.b64.json so the repo alone is enough to rebuild.
"""
import base64, io, json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
ASSETS = os.path.join(ROOT, "assets-src")

IMAGES = {
    "hero":      "unsplash-hero-students-1522202176988.jpg",
    "about":     "unsplash-about-workshop-1517245386807.jpg",
    "classa":    "unsplash-class-students-1523240795612.jpg",
    "classb":    "unsplash-class-collab-1531482615713.jpg",
    "classc":    "unsplash-class-team-1522071820081.jpg",
    "googleads": "media-generation-course-google-ads-0-e743a56a-9e89-4b27-838a-2be0574409e1.jpg",
    "wordpress": "media-generation-course-wordpress-0-02ef6708-45e9-442c-bfe9-f457a3a88509.jpg",
    "seo":       "media-generation-course-seo-0-46c6f662-3cd4-442f-ad8b-67a301686f9f.jpg",
    "logo":      "spark-wordmark.png",
    "favicon":   "spark-favicon.png",
    "lockup":    "spark-lockup.png",
    "mark":      "spark-mark.png",
}

PAGES = {
    "index":      "SPARK — School of Practical AI & Real Knowledge | Learn. Build. Launch. Earn.",
    "about":      "About SPARK | School of Practical AI & Real Knowledge",
    "courses":    "Courses | SPARK — School of Practical AI & Real Knowledge",
    "admissions": "Admissions | SPARK — School of Practical AI & Real Knowledge",
    "careers":    "Careers & Mentorship | SPARK",
    "faq":        "FAQs | SPARK — School of Practical AI & Real Knowledge",
    "contact":    "Contact & Enrollment | SPARK",
}

CARD_W = 880
QUALITY = 68


def data_uri(path, key=""):
    from PIL import Image
    if path.lower().endswith(".png") and key == "favicon":
        # favicon keeps PNG (transparency) — it's tiny
        im = Image.open(path).convert("RGBA")
        if im.width > 480:
            im = im.resize((480, int(im.height * 480 / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "PNG", optimize=True)
        return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")
    if path.lower().endswith(".png"):
        # transparent logo PNGs: flatten onto the site's dark background.
        # Header/footer are solid #0b0e14, so JPEG blends seamlessly and
        # is far smaller than a transparent PNG (the lockup PNG was 299 KB
        # and is inlined in all 7 footers — it pushed the push over the
        # size limit). q80 keeps the lettering crisp.
        im = Image.open(path).convert("RGBA")
        if im.width > 480:
            im = im.resize((480, int(im.height * 480 / im.width)), Image.LANCZOS)
        bg = Image.new("RGBA", im.size, (11, 14, 20, 255))
        bg.alpha_composite(im)
        im = bg.convert("RGB")
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=80, optimize=True, progressive=True)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")
    im = Image.open(path).convert("RGB")
    if im.width > CARD_W:
        im = im.resize((CARD_W, int(im.height * CARD_W / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def read(rel):
    with open(os.path.join(SRC, rel), encoding="utf-8") as f:
        return f.read()


def main():
    css, js = read("styles.css"), read("script.js")
    head_top = read("partials/head_top.html")
    header = read("partials/header.html")
    footer = read("partials/footer.html")
    tail = read("partials/tail.html")
    cta = read("partials/cta-band.html")
    enroll = read("partials/enroll-form.html")

    cache_path = os.path.join(SRC, "images.b64.json")
    cache = json.load(open(cache_path, encoding="utf-8")) if os.path.exists(cache_path) else {}
    uris = {}
    for key, fname in IMAGES.items():
        src = os.path.join(ASSETS, fname)
        if os.path.exists(src):
            uris[key] = data_uri(src, key)
        elif key in cache:
            uris[key] = cache[key]
        else:
            sys.exit(f"missing image for {key}")
    json.dump(uris, open(cache_path, "w", encoding="utf-8"))

    def img_repl(m):
        key = m.group(1)
        if key not in uris:
            sys.exit(f"unknown image token: {key}")
        return uris[key]

    for name, title in PAGES.items():
        body = read(f"pages/{name}.html")
        body = body.replace("{{CTA}}", cta).replace("{{ENROLL}}", enroll)
        html = head_top.replace("{{TITLE}}", title) + header + body + footer + tail
        html = html.replace("{{CSS}}", css).replace("{{JS}}", js)
        html, n = re.subn(r"\{\{IMG:([a-z]+)\}\}", img_repl, html)
        leftover = re.findall(r"{{[A-Z_]+}}", html)
        if leftover:
            sys.exit(f"{name}: leftover tokens {leftover}")
        out = os.path.join(ROOT, f"{name}.html")
        open(out, "w", encoding="utf-8").write(html)
        print(f"{name}.html ({os.path.getsize(out)//1024} KB, {n} images)")


if __name__ == "__main__":
    main()
