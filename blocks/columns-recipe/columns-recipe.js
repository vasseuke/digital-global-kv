import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Columns — recipe variant.
 * A two-column layout used for recipe content: a featured promo (image + content
 * card) or a recipe body (ingredients/instructions beside a product/share sidebar).
 * Forked from base columns; targets its own class.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cols = [...row.children];
  block.classList.add(`columns-recipe-${cols.length}-cols`);

  cols.forEach((col) => {
    col.classList.add('columns-recipe-col');
    const pic = col.querySelector('picture');
    if (pic && col.children.length === 1) {
      col.classList.add('columns-recipe-img-col');
    }
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });
}
