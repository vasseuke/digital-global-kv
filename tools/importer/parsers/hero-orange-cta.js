/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-orange-cta
 * Base block: hero
 * Source: archive/listing pages (section.zipcodefinder)
 *   e.g. https://www.dunkincreamer.com/author/danoneitccadmin/
 * Generated: 2026-09-23
 *
 * Library structure (Hero): 1 column, up to 3 rows.
 *   Row 1: block name.
 *   Row 2: background image (optional) — none in this solid-color CTA banner.
 *   Row 3: single cell holding title heading, the "Where to buy" pill CTA, and
 *          the "Looking for other Dunkin products? Click here" subtitle line.
 *
 * Source structure (validated against source.html):
 *   section.zipcodefinder > .container > .wrapper
 *     .zipcodetitle (heading text)
 *     .btn-wrapper > a.button (primary CTA)
 *     .zipcodesubtitle (copy + inline `here` link)
 *
 * Variations handled:
 *   - Optional background image (img/picture) added as row 2 only if present.
 *   - Title is a <div>; promoted to an <h2> so it renders as a heading.
 *   - Subtitle preserved as-is (keeps the inline link intact).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 2: optional background image.
  const bg = element.querySelector('picture, img[class*="bg"], img');
  const bgNode = bg && bg.tagName === 'IMG' && bg.closest('picture') ? bg.closest('picture') : bg;
  if (bgNode) cells.push([bgNode]);

  const contentCell = [];

  // Title — source uses a <div class="zipcodetitle">; promote to a heading.
  const titleEl = element.querySelector('.zipcodetitle, h1, h2, [class*="title"]');
  if (titleEl) {
    const text = titleEl.textContent.trim();
    if (titleEl.tagName === 'DIV' || titleEl.tagName === 'SPAN') {
      const h = document.createElement('h2');
      h.textContent = text;
      contentCell.push(h);
    } else {
      contentCell.push(titleEl);
    }
  }

  // Primary CTA pill ("Where to buy").
  const cta = element.querySelector('.btn-wrapper a, a.button');
  if (cta) contentCell.push(cta);

  // Subtitle line ("Looking for other Dunkin products? Click here") — keep inline link.
  const subtitle = element.querySelector('.zipcodesubtitle');
  if (subtitle) {
    contentCell.push(subtitle);
  } else {
    // Fallback: any remaining link not already captured as the primary CTA.
    Array.from(element.querySelectorAll('a')).forEach((a) => {
      if (a !== cta) contentCell.push(a);
    });
  }

  // Empty-block guard.
  if (!contentCell.length && !bgNode) {
    element.replaceWith(...element.childNodes);
    return;
  }

  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-orange-cta', cells });
  element.replaceWith(block);
}
