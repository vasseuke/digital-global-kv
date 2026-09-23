/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-light-withimg
 * Base block: hero
 * Source: https://www.dunkincreamer.com/ (section.home_header .hero_banner)
 * Generated: 2026-09-23
 *
 * Library structure (Hero): 1 column, 3 rows.
 *   Row 1: block name
 *   Row 2: image cell (product/hero image)
 *   Row 3: text cell (title heading, subheading paragraph, optional CTA)
 *
 * Source variations handled:
 *   - Display heading in <h1> (fallback h2), supporting copy in <h3> (fallback p)
 *   - One or more product images inside .hero_img (each may be wrapped in <picture>)
 *   - Optional CTA links
 */
export default function parse(element, { document }) {
  // Extract text content
  const heading = element.querySelector('.hero_text h1, .hero_text h2, h1, h2, [class*="title"]');
  const subheading = element.querySelector('.hero_text h3, .hero_text h4, .hero_text p, h3');
  const ctaLinks = Array.from(element.querySelectorAll('.hero_text a, .hero_banner a'));

  // Extract product / hero image(s). Prefer <picture>, fall back to raw <img>.
  const imageWraps = Array.from(element.querySelectorAll('.hero_img picture, .hero_img img'));
  // De-duplicate: if a <picture> is captured, skip its inner <img>
  const images = [];
  imageWraps.forEach((node) => {
    if (node.tagName === 'IMG' && node.closest('picture')) return;
    images.push(node);
  });

  // Empty-block guard
  if (!heading && !subheading && images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: image cell (all product/hero images)
  if (images.length) {
    cells.push([images]);
  }

  // Row 3: text cell (title, subheading, CTAs)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-light-withimg', cells });
  element.replaceWith(block);
}
