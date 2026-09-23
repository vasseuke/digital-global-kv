/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-recipe
 * Base block: cards
 * Source: https://www.dunkincreamer.com/learn-more/coffee-creamer-recipes/ (section.recipegrid-section)
 * Generated: 2026-09-23
 *
 * Library structure (Cards): 2 columns, multiple rows.
 *   Row 1: block name.
 *   Each subsequent row = one recipe card:
 *     Cell 1: recipe photo (mandatory).
 *     Cell 2: text content — recipe title (as heading link) + timing/serves meta.
 *
 * Source structure (validated against source.html):
 *   section.recipegrid-section .row > .column
 *     a[href] (wraps the whole card)
 *       .relative > figure > img          (recipe photo)
 *       figcaption > .recipe-title         (title)
 *                  > .recipe-minute_serves (timing + serves spans)
 *
 * Variations handled:
 *   - Each card is wrapped in an <a>; the title is turned into a linked heading
 *     so the card remains clickable while the image stays in cell 1.
 *   - Lazy-loaded images: real src restored from data-src fallbacks.
 */
export default function parse(element, { document }) {
  const unlazy = (img) => {
    if (!img) return img;
    const cur = img.getAttribute('src') || '';
    if (!cur || /^data:/.test(cur)) {
      const real = img.getAttribute('data-src')
        || img.getAttribute('data-lazy-src')
        || img.getAttribute('data-original');
      if (real) img.setAttribute('src', real);
    }
    return img;
  };

  const cards = Array.from(element.querySelectorAll(':scope .row .column, .column'));

  const cells = [];
  cards.forEach((col) => {
    const link = col.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : null;

    // Cell 1: recipe photo.
    const img = unlazy(col.querySelector('figure img, .relative img, img'));

    // Cell 2: title (as linked heading) + timing/serves meta.
    const contentCell = [];
    const title = col.querySelector('.recipe-title');
    if (title && title.textContent.trim()) {
      const h = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = title.textContent.trim();
        h.appendChild(a);
      } else {
        h.textContent = title.textContent.trim();
      }
      contentCell.push(h);
    }

    const meta = col.querySelector('.recipe-minute_serves');
    if (meta && meta.textContent.trim()) {
      const p = document.createElement('p');
      // Join the spans (timing, serves) with a separator.
      const parts = Array.from(meta.querySelectorAll('span'))
        .map((s) => s.textContent.trim())
        .filter(Boolean);
      p.textContent = parts.length ? parts.join(' · ') : meta.textContent.trim();
      contentCell.push(p);
    }

    if (img || contentCell.length) {
      cells.push([img || '', contentCell.length ? contentCell : '']);
    }
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-recipe', cells });
  element.replaceWith(block);
}
