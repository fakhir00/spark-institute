#!/usr/bin/env python3
"""Build the SPARK institute site.

Reads src/template.html, inlines src/styles.css + src/script.js, and replaces
{{IMG:key}} tokens with base64 data URIs generated from assets in assets-src/.
Writes the finished page to ./index.html and caches the data URIs in
src/images.b64.json so the repo alone is enough to rebuild.
"""
import base64, io, json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
ASSETS = os.path.join(ROOT, "assets-src")

# template token -> source image file (generated course covers)
IMAGES = {
    "meta":      "media-generation-course-meta-ads-0-225622cd-1924-4b1b-898f-e2f442f2c211.jpg",
    "googleads": "media-generation-course-google-ads-0-e743a56a-9e89-4b27-838a-2be0574409e1.jpg",
    "trading":   "media-generation-course-trading-0-ed0ac00e-6d92-403e-a065-4958f2c5b696.jpg",
    "shopify":   "media-generation-course-shopify-0-695571ab-4198-407c-a3a0-6bab4e118221.jpg",
    "ai":        "media-generation-course-ai-everyone-0-30eb1923-3a3f-4d45-8bbf-be24c2d76b46.jpg",
    "wordpress": "media-generation-course-wordpress-0-02ef6708-45e9-442c-bfe9-f457a3a88509.jpg",
    "seo":       "media-generation-course-seo-0-46c6f662-3cd4-442f-ad8b-67a301686f9f.jpg",
}

CARD_W = 880  # px wide is plenty for the card thumbnails
QUALITY = 68


def data_uri(path):
    from PIL import Image
    im = Image.open(path).convert("RGB")
    if im.width > CARD_W:
        im = im.resize((CARD_W, int(im.height * CARD_W / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return "data:image/jpeg;base64," + b64


def main():
    with open(os.path.join(SRC, "template.html"), encoding="utf-8") as f:
        html = f.read()
    with open(os.path.join(SRC, "styles.css"), encoding="utf-8") as f:
        css = f.read()
    with open(os.path.join(SRC, "script.js"), encoding="utf-8") as f:
        js = f.read()

    cache_path = os.path.join(SRC, "images.b64.json")
    cache = {}
    if os.path.exists(cache_path):
        with open(cache_path, encoding="utf-8") as f:
            cache = json.load(f)

    uris = {}
    for key, fname in IMAGES.items():
        src = os.path.join(ASSETS, fname)
        if os.path.exists(src):
            uris[key] = data_uri(src)
            print(f"encoded {key}: {len(uris[key])//1024} KB")
        elif key in cache:
            uris[key] = cache[key]
            print(f"reused cached {key}")
        else:
            sys.exit(f"missing image for {key}: {src}")

    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(uris, f)

    def repl(m):
        key = m.group(1)
        if key not in uris:
            sys.exit(f"unknown image token: {key}")
        return uris[key]

    html = html.replace("{{CSS}}", css).replace("{{JS}}", js)
    html, n = re.subn(r"\{\{IMG:([a-z]+)\}\}", repl, html)
    print(f"replaced {n} image tokens")

    out = os.path.join(ROOT, "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"wrote {out} ({os.path.getsize(out)//1024} KB)")


if __name__ == "__main__":
    main()
