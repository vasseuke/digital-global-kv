/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-promo
 * Base block: columns
 * Source: https://www.dunkincreamer.com/ (section.column-grid)
 * Generated: 2026-09-23
 *
 * Library structure (Columns): flexible columns x rows.
 *   Row 1: block name.
 *   Subsequent rows: each cell becomes a responsive column; every row must have
 *   the same number of columns as the second row.
 *
 * Visual grouping (from source + live DOM):
 *   section.column-grid holds one or more promo panels (`.dunkin_home`, and on
 *   other template pages potentially additional / seasonal panels). Each panel
 *   renders as a side-by-side promo:
 *     Cell 1: lifestyle / promo image (.home_img)
 *     Cell 2: QR image (.dannon_qr) + earning CTA (.dunkin_earning: button + copy)
 *   Each panel becomes one 2-column row so multiple panels stack as extra rows.
 *
 * Variations handled:
 *   - Images live inside <picture>; reference the <picture> (or bare <img>).
 *   - A panel may omit the leading image — pad with an empty cell to keep the
 *     column count consistent.
 *   - If no recognizable panels are found, fall back to a single row built from
 *     the section's own image + remaining content.
 */
export default function parse(element, { document }) {
  const pickMedia = (scope) => {
    if (!scope) return null;
    const pic = scope.querySelector('picture');
    if (pic) return pic;
    const img = scope.querySelector('img');
    return img || null;
  };

  const buildPanelRow = (panel) => {
    // Cell 1: primary promo/lifestyle image
    const imgScope = panel.querySelector('.home_img') || panel;
    const media = pickMedia(imgScope);

    // Cell 2: QR image + earning CTA (button + supporting copy)
    const contentCell = [];
    const qr = pickMedia(panel.querySelector('.dannon_qr'));
    if (qr) contentCell.push(qr);

    const earning = panel.querySelector('.dunkin_earning');
    if (earning) {
      // Preserve the CTA link and any supporting paragraphs
      Array.from(earning.querySelectorAll('a')).forEach((a) => contentCell.push(a));
      Array.from(earning.querySelectorAll('p, h2, h3, h4')).forEach((n) => contentCell.push(n));
    } else {
      // Generic fallback: any CTA/text not already captured as the main image
      Array.from(panel.querySelectorAll('a')).forEach((a) => {
        if (!media || !media.contains(a)) contentCell.push(a);
      });
      Array.from(panel.querySelectorAll('p, h2, h3, h4')).forEach((n) => contentCell.push(n));
    }

    return [media || '', contentCell.length ? contentCell : ''];
  };

  // Identify promo panels: direct child element containers of the section.
  const panels = Array.from(element.children).filter((c) => c.nodeType === 1);

  const cells = [];
  panels.forEach((panel) => {
    const row = buildPanelRow(panel);
    // Only keep rows that carry real content
    if (row[0] || (Array.isArray(row[1]) && row[1].length)) cells.push(row);
  });

  // Fallback: no panels resolved — build one row from the section itself.
  if (cells.length === 0) {
    const row = buildPanelRow(element);
    if (row[0] || (Array.isArray(row[1]) && row[1].length)) cells.push(row);
  }

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}
