/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns
 * Base block: columns
 * Source: https://www.dunkincreamer.com/contact-us/ (section.column-grid)
 * Generated: 2026-09-23
 *
 * Library structure (Columns): flexible columns x rows.
 *   Row 1: block name.
 *   Subsequent rows: each cell becomes a responsive column. Every row must carry
 *   the same number of columns as the second row.
 *
 * Source structure (validated against source.html):
 *   section.column-grid > .container.block > .row.grid-2-col > .column (xN)
 *   Each `.column` holds a `.text` block (heading + copy). Each column maps to
 *   one cell in a single row, so the plain two-column text renders side by side.
 *
 * Variations handled:
 *   - Column count derived from the number of `.column` elements (not hard-coded).
 *   - Falls back to the section's own content if the expected wrappers are absent.
 */
export default function parse(element, { document }) {
  const pickContent = (col) => {
    // Prefer the inner text block; otherwise take the column's own content.
    const textBlock = col.querySelector('.text, .cont-text, .text-section');
    const src = textBlock || col;
    const nodes = Array.from(src.childNodes).filter((n) => {
      if (n.nodeType === 1) return true; // element
      if (n.nodeType === 3) return n.textContent.trim().length > 0; // non-empty text
      return false;
    });
    return nodes.length ? nodes : [src];
  };

  let columns = Array.from(element.querySelectorAll(':scope .row .column'));
  // Fallback: any direct `.column` descendants.
  if (!columns.length) columns = Array.from(element.querySelectorAll('.column'));

  const cells = [];
  if (columns.length) {
    const row = columns.map((col) => pickContent(col));
    cells.push(row);
  }

  // Fallback: no recognizable columns — emit the section's meaningful content
  // as a single-cell row so nothing is lost.
  if (cells.length === 0) {
    const fallback = Array.from(element.querySelectorAll('.text, .cont-text'))
      .flatMap((t) => Array.from(t.children));
    if (fallback.length) cells.push([fallback]);
  }

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
