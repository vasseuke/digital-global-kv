/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards
 * Base block: cards
 * Source: https://www.dunkincreamer.com/learn-more/pressroom/ (section.discoverflavors)
 * Generated: 2026-09-23
 *
 * Library structure (Cards): 2 columns, multiple rows.
 *   Row 1: block name.
 *   Each subsequent row = one product card:
 *     Cell 1: product image (mandatory).
 *     Cell 2: text content — size label, product name (as heading), SHOP NOW CTA.
 *
 * Source structure (validated against source.html):
 *   section.discoverflavors .find-products > ul > li
 *     a.new_flavor > .flavor_img > img            (product image)
 *                  > .find-des > .smalltext span   (size label)
 *                             > .navlabel          (product name; may contain sup/newtag)
 *     .btn-wrapper > a (SHOP NOW)
 *
 * Variations handled:
 *   - `.navlabel` may include a "newtag" badge and sup/sub markup — preserved.
 *   - SHOP NOW href is a non-navigational javascript: stub (note source typo
 *     "javscript:"); rewritten to the card's product page URL.
 *   - Card with no image still emits with an empty first cell to keep 2 columns.
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.find-products li, ul > li'));

  const cells = [];
  cards.forEach((li) => {
    // Cell 1: product image.
    const img = li.querySelector('.flavor_img img, img');

    // Cell 2: text content.
    const contentCell = [];

    // Size label (small text).
    const size = li.querySelector('.smalltext');
    if (size && size.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = size.textContent.trim();
      contentCell.push(p);
    }

    // Product name → heading (preserve inline markup like sup/newtag).
    const name = li.querySelector('.navlabel');
    if (name && name.textContent.trim()) {
      const h = document.createElement('h3');
      h.innerHTML = name.innerHTML;
      contentCell.push(h);
    }

    // SHOP NOW CTA — rewrite non-navigational hrefs to the product page.
    const shop = li.querySelector('.btn-wrapper a, a.button');
    const productLink = li.querySelector('a.new_flavor');
    if (shop) {
      const href = shop.getAttribute('href') || '';
      if (!/^(https?:|\/)/i.test(href) && productLink) {
        shop.setAttribute('href', productLink.getAttribute('href'));
      }
      contentCell.push(shop);
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
