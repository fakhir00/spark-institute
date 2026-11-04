# SPARK — Institute Website

**SPARK — School of Practical AI & Real Knowledge.** Official institute website.
*Learn. Build. Apply.*

A single-page static site (`index.html` at the repo root, served directly by Vercel — no build step).

## Layout

The page architecture follows the institute-site pattern (hero → difference → experience pillars → courses → teaching method → mentorship/portfolio → who-it's-for → why → final CTA → enrollment form → footer), fitted to SPARK's content. Course cards match the reference card design: category pill, cover art, duration/hours/assignments/learners meta, full-width **Enroll Now** button.

## Courses (7)

Advertising with Meta · Google Ads · Practical Guide to Trading · E-Commerce with Shopify · AI for Everyone · WordPress Development · Search Engine Optimization

## Editing

The page is generated — don't edit `index.html` by hand:

```
src/template.html   page markup, {{IMG:key}} / {{CSS}} / {{JS}} tokens
src/styles.css      all styling
src/script.js       interactions (menu, reveal, enroll form)
src/images.b64.json cached base64 course covers (UTF-8, committed)
assets-src/         original cover art (local only, not committed)
```

Rebuild with:

```bash
python3 build.py   # writes ./index.html
```

Course meta (durations, hours, assignments, learner counts) lives in `src/template.html` — keep all cards structurally identical when editing.

## Deploy

Vercel project linked to this repo auto-deploys `main`. No build command needed.
