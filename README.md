# SPARK — Institute Website

**SPARK — School of Practical AI & Real Knowledge.** Official institute website.
*Learn. Build. Apply.*

A multi-page static site (no build step on Vercel — HTML files are served directly).

## Pages

`index.html` (Home) · `about.html` · `courses.html` · `admissions.html` ·
`careers.html` · `faq.html` · `contact.html`

The page architecture follows the institute-site pattern (hero → feature strip →
about → stats → experience pillars → courses → teaching method → mentorship →
testimonials → events → blog → trusted-by → final CTA → enrollment → footer),
fitted to SPARK's content. Course cards match the reference card design:
category pill, cover art, duration/hours/assignments/learners meta, full-width
**Enroll Now** button.

## Courses (7)

Advertising with Meta · Google Ads · Practical Guide to Trading ·
E-Commerce with Shopify · AI for Everyone · WordPress Development ·
Search Engine Optimization

## Editing

Pages are generated — don't edit the root HTML files by hand:

```
src/pages/<name>.html   page bodies, with {{COURSES}} / {{CTA}} / {{ENROLL}} tokens
src/partials/           shared head, header, footer, course cards, CTA band, enroll form
src/styles.css          all styling
src/script.js           interactions (menu, reveal, counters, enroll form, FAQ)
src/images.b64.json     cached base64 course covers (UTF-8, committed)
assets-src/             original cover art (local only, not committed)
```

Rebuild with:

```bash
python3 build.py   # writes *.html at the repo root
```

Course meta (durations, hours, assignments, learner counts) lives in
`src/partials/course-cards.html` — keep all cards structurally identical when
editing. Sections marked `PLACEHOLDER` (stats, testimonials, events, blog,
trusted-by) need real content.

## Deploy

Vercel project linked to this repo auto-deploys `main`. No build command needed.
