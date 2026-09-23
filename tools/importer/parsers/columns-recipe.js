/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-recipe
 * Base block: columns
 * Sources:
 *   https://www.dunkincreamer.com/learn-more/coffee-creamer-recipes/ (section.recipefeatured-section)
 *   https://www.dunkincreamer.com/learn-more/coffee-creamer-recipes/coconut-cream-pie-blender/ (section.productused-section)
 * Generated: 2026-09-23
 *
 * Library structure (Columns): flexible columns x rows.
 *   Row 1: block name.
 *   Row 2+: each cell becomes a responsive column; all rows share the row-2 column count.
 *
 * This variant is a recipe two-column layout with two shapes:
 *   A) Featured recipe promo (.featured-grid): image | content card
 *      Cell 1: the recipe photo (figure/img).
 *      Cell 2: the content card — recipe icon, title, timing/serves meta,
 *              description, and the "Let's make it" CTA (from <figcaption>).
 *   B) Product-used layout (.column left / .column right):
 *      Cell 1: left column (INGREDIENTS / INSTRUCTIONS copy).
 *      Cell 2: right column (product image + product title).
 *
 * Variations handled:
 *   - Falls back from A to B based on presence of `.featured-grid`.
 *   - Meaningful content extracted per column; empty/whitespace text skipped.
 */
export default function parse(element, { document }) {
  const meaningful = (root) => Array.from(root.childNodes).filter((n) => {
    if (n.nodeType === 1) return true;
    if (n.nodeType === 3) return n.textContent.trim().length > 0;
    return false;
  });

  // Restore a real src for lazy-loaded images (WP lazyload leaves src empty
  // and stashes the URL in data-src / data-lazy-src / data-original).
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

  const cells = [];

  const featured = element.querySelector('.featured-grid');
  if (featured) {
    // A) Featured promo: image cell | content-card cell.
    const img = unlazy(featured.querySelector('figure img, .relative img, img'));
    const caption = featured.querySelector('figcaption');

    const cardCell = [];
    if (caption) {
      // Preserve icon, title, meta, description and CTA in order.
      const parts = caption.querySelectorAll(
        '.recipe-icon, .recipe-title, .recipe-minute_serves, .recipe-description, .recipe-button a, .recipe-button, a.button'
      );
      // De-duplicate: skip a bare `.recipe-button` if we already captured its inner <a>.
      const seen = new Set();
      parts.forEach((p) => {
        if (p.matches('.recipe-button') && p.querySelector('a')) return;
        if (!seen.has(p)) { seen.add(p); cardCell.push(p); }
      });
      if (!cardCell.length) meaningful(caption).forEach((n) => cardCell.push(n));
    }

    if (img || cardCell.length) {
      cells.push([img || '', cardCell.length ? cardCell : '']);
    }
  } else {
    // B) Generic column layout (.column left / .column right, etc.).
    let columns = Array.from(element.querySelectorAll(':scope .row .column'));
    if (!columns.length) columns = Array.from(element.querySelectorAll('.column'));
    if (columns.length) {
      const row = columns.map((col) => {
        // Prefer an inner text/content wrapper; else the column itself.
        const inner = col.querySelector('.text__container, .text, .recipe-product-section') || col;
        const nodes = meaningful(inner);
        return nodes.length ? nodes : [inner];
      });
      cells.push(row);
    }
  }

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-recipe', cells });
  element.replaceWith(block);
}
