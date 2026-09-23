/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-recipe
 * Base block: carousel
 * Source: https://www.dunkincreamer.com/ (section.carousel-section .tns-outer)
 * Generated: 2026-09-23
 *
 * Library structure (Carousel): 2 columns, multiple rows.
 *   Row 1: block name
 *   Each subsequent row = one slide:
 *     Cell 1: image (mandatory)
 *     Cell 2: text content (title as heading, metadata, optional CTA)
 *
 * Source variations handled:
 *   - tiny-slider (tns) duplicates each recipe as clones for the infinite loop,
 *     so iterate the recipe anchors and DEDUPLICATE by normalized href.
 *   - Recipe photo: the LIVE page renders it as a CSS `background-image` on the
 *     <figure> (no <img>); the static/cached HTML uses <figure><img>. Handle
 *     BOTH: prefer a real <img>, else build one from the figure's
 *     background-image URL. Skip the decorative inline SVG / base64 recipe-icon.
 *   - Title in .recipe-title; time/serves in .recipe-minute_serves <span>s.
 */
export default function parse(element, { document }) {
  const normalize = (href) => (href || '').replace(/\/+$/, '');

  const bgUrl = (el) => {
    if (!el) return null;
    const bg = el.style && el.style.backgroundImage;
    const src = bg || (el.getAttribute && el.getAttribute('style')) || '';
    const m = src.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    return m ? m[1] : null;
  };

  // Each recipe slide is an <a href>. Dedupe tns clones by href.
  const links = Array.from(element.querySelectorAll('a[href]'));

  const cells = [];
  const seen = new Set();

  links.forEach((link) => {
    const key = normalize(link.getAttribute('href'));
    if (!key || seen.has(key)) return;

    // Cell 1: recipe photo. Prefer a real content <img>, else the figure bg-image.
    let imgEl = link.querySelector('figure img, .relative img, img:not([src^="data:"])');
    if (!imgEl) {
      const url = bgUrl(link.querySelector('figure')) || bgUrl(link.querySelector('.relative'));
      if (url) {
        imgEl = document.createElement('img');
        imgEl.setAttribute('src', url);
        const t = link.querySelector('.recipe-title');
        if (t && t.textContent.trim()) imgEl.setAttribute('alt', t.textContent.trim());
      }
    }
    if (!imgEl) return; // image is mandatory for a valid slide
    seen.add(key);

    // Cell 2: text content
    const contentCell = [];

    const titleEl = link.querySelector('.recipe-title');
    if (titleEl && titleEl.textContent.trim()) {
      const heading = document.createElement('h3');
      heading.textContent = titleEl.textContent.trim();
      contentCell.push(heading);
    }

    const metaEl = link.querySelector('.recipe-minute_serves');
    if (metaEl) {
      // Prefer the individual <span>s ("5 Minutes", "Serves 1"). Some DOM
      // variations render the time/serves text without <span> wrappers, so
      // fall back to the element's own text split on whitespace-collapsed
      // separators. This guarantees the meta line is never dropped when the
      // element exists.
      let parts = Array.from(metaEl.querySelectorAll('span'))
        .map((s) => s.textContent.trim())
        .filter(Boolean);
      if (!parts.length) {
        let raw = (metaEl.textContent || '').replace(/\s+/g, ' ').trim();
        // Insert a boundary before "Serves"/"Makes" when the time and serving
        // values run together (adjacent spans render with no separator).
        raw = raw.replace(/\s*(Serves|Makes)\b/i, ' • $1');
        if (raw) parts = [raw];
      }
      if (parts.length) {
        const meta = document.createElement('p');
        meta.textContent = parts.join(' • ');
        contentCell.push(meta);
      }
    }

    // Optional CTA linking to the recipe
    const cta = document.createElement('a');
    cta.setAttribute('href', link.getAttribute('href'));
    cta.textContent = 'View Recipe';
    contentCell.push(cta);

    cells.push([imgEl, contentCell]);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-recipe', cells });
  element.replaceWith(block);
}
