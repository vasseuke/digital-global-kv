# Dunkin' Creamer Site Discovery Plan

Discover all pages and identify the distinct layouts (page templates) for **https://www.dunkincreamer.com/** so the site can be cataloged ahead of any migration work.

## Goal

Produce a complete inventory of the site's URLs, then group those pages into a small set of reusable layouts/templates based on their structure. The end result is a site catalog that tells us how many distinct page types exist and which URLs belong to each.

## Approach

1. **URL Discovery** — Gather every reachable page URL, preferring the site's sitemap (`/sitemap.xml`) and falling back to crawling if no sitemap exists.
2. **Page Analysis & Grouping** — Analyze representative pages, detect their structural patterns, and cluster similar pages into templates (e.g. homepage, product page, article/recipe page, contact page).
3. **Catalog Output** — Record the discovered templates and the URLs mapped to each, along with a count of page types.

## Checklist

- [ ] Confirm the site is reachable and locate its sitemap (`/sitemap.xml` or `robots.txt` reference)
- [ ] Discover the full list of page URLs (sitemap-first, crawl fallback)
- [ ] De-duplicate and normalize the URL list (drop assets, redirects, query-only variants)
- [ ] Analyze representative pages to detect structural patterns
- [ ] Group similar pages into distinct layouts/templates
- [ ] Assign each discovered URL to a template
- [ ] Produce the site catalog (templates + page counts + URL-to-template mapping)
- [ ] Summarize findings: total pages, number of distinct layouts, and example URL per layout

## Notes

- This is a **read-only discovery** pass — no content import, block generation, or code changes are performed here.
- Execution requires **Execute mode**; while in plan mode I will not run discovery tools or write catalog files.
- Once discovery completes, the natural next step (separate task) would be full template/block cataloging and migration planning.
