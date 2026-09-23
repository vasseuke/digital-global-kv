import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards — recipe listing variant.
 * Each row is a recipe card: clickable photo, title, and timing/serves meta.
 * Forked from base cards; targets its own class.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      // The body cell holds the recipe title/meta (heading or text); every
      // other cell (picture, or an empty image slot when the import lacks one)
      // is the image cell. Classify by content so empty image cells keep the
      // image class rather than collapsing into a second body.
      if (div.querySelector('h1, h2, h3, h4, h5, h6') || div.textContent.trim()) {
        div.className = 'cards-recipe-card-body';
      } else {
        div.className = 'cards-recipe-card-image';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
