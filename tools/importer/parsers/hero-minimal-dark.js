/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-minimal-dark
 * Base block: hero
 * Source: https://www.dunkincreamer.com/learn-more/coffee-creamer-recipes/coconut-cream-pie-blender/ (section.recipeteaser-section)
 * Generated: 2026-09-23
 *
 * Library structure (Hero): 1 column, up to 3 rows.
 *   Row 1: block name.
 *   Row 2: background image — the full-bleed food photo.
 *   Row 3: single content cell — recipe icon, title (as heading), timing/serves
 *          meta, and the description.
 *
 * Source structure (validated against source.html):
 *   section.recipeteaser-section .recipeteaser__wrapper
 *     figure.recipeimage > img           (food photo → background)
 *     figcaption.text_container
 *       .recipe-icon (img)               (icon)
 *       .recipe-title                    (title → heading)
 *       .recipe-minute_serves (spans)    (meta)
 *       .recipe-description              (description)
 *
 * Variations handled:
 *   - Lazy-loaded photo: real src restored from data-src fallbacks.
 *   - Recipe icon is an inline data-URI SVG; preserved as-is.
 *   - Title is a <div>; promoted to an <h1> heading.
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

  const cells = [];

  // Row 2: full-bleed food photo (background image).
  const photo = unlazy(element.querySelector('figure.recipeimage img, .recipeimage img, figure img'));
  if (photo) cells.push([photo]);

  // Row 3: content card.
  const caption = element.querySelector('figcaption.text_container, figcaption, .text_container');
  const scope = caption || element;

  const contentCell = [];
  const icon = scope.querySelector('.recipe-icon');
  if (icon) contentCell.push(icon);

  const title = scope.querySelector('.recipe-title, h1, h2');
  if (title && title.textContent.trim()) {
    if (/^(DIV|SPAN)$/.test(title.tagName)) {
      const h = document.createElement('h1');
      h.textContent = title.textContent.trim();
      contentCell.push(h);
    } else {
      contentCell.push(title);
    }
  }

  const meta = scope.querySelector('.recipe-minute_serves');
  if (meta && meta.textContent.trim()) {
    const p = document.createElement('p');
    const parts = Array.from(meta.querySelectorAll('span'))
      .map((s) => s.textContent.trim())
      .filter(Boolean);
    p.textContent = parts.length ? parts.join(' · ') : meta.textContent.trim();
    contentCell.push(p);
  }

  const desc = scope.querySelector('.recipe-description');
  if (desc && desc.textContent.trim()) {
    const p = document.createElement('p');
    p.innerHTML = desc.innerHTML;
    contentCell.push(p);
  }

  // Empty-block guard.
  if (!photo && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  if (contentCell.length) cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-minimal-dark', cells });
  element.replaceWith(block);
}
