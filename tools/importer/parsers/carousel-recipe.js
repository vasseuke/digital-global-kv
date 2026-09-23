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
 *   - tiny-slider (tns) duplicates each slide multiple times (clones for the
 *     infinite loop). The static markup also nests .item elements due to
 *     unclosed tags. To avoid duplicate/mis-associated rows, iterate over the
 *     recipe anchors directly and DEDUPLICATE by normalized href.
 *   - Each recipe is an <a href> wrapping .featured-grid: <figure><img> (photo)
 *     plus <figcaption> with .recipe-title and .recipe-minute_serves spans.
 *   - Skip the decorative base64 SVG recipe-icon.
 */
export default function parse(element, { document }) {
  const normalize = (href) => (href || '').replace(/\/+$/, '');

  // Select recipe anchors directly (each slide is an <a>). This sidesteps the
  // malformed nested .item structure and lets us dedupe tns clones by href.
  const links = Array.from(element.querySelectorAll('a[href]'));

  const cells = [];
  const seen = new Set();

  links.forEach((link) => {
    const key = normalize(link.getAttribute('href'));
    if (!key || seen.has(key)) return;

    // Real recipe photo: skip base64 SVG icons
    const img = link.querySelector('figure img, img:not([src^="data:"])');
    if (!img) return; // image is mandatory for a valid slide
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
      const spans = Array.from(metaEl.querySelectorAll('span'))
        .map((s) => s.textContent.trim())
        .filter(Boolean);
      if (spans.length) {
        const meta = document.createElement('p');
        meta.textContent = spans.join(' • ');
        contentCell.push(meta);
      }
    }

    // Optional CTA linking to the recipe
    const cta = document.createElement('a');
    cta.setAttribute('href', link.getAttribute('href'));
    cta.textContent = 'View Recipe';
    contentCell.push(cta);

    cells.push([img, contentCell]);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-recipe', cells });
  element.replaceWith(block);
}
