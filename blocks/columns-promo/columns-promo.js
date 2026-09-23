import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Columns — promo panels variant.
 * Renders a single row's cells as side-by-side promotional panels of differing
 * content. Forked from the base columns; targets its own class.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cols = [...row.children];
  block.classList.add(`columns-promo-${cols.length}-cols`);

  cols.forEach((col) => {
    col.classList.add('columns-promo-panel');
    const pic = col.querySelector('picture');
    if (pic && col.children.length === 1) {
      col.classList.add('columns-promo-img-col');
    }
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });
}
