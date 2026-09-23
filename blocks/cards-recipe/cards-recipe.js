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
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-recipe-card-image';
      } else {
        div.className = 'cards-recipe-card-body';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
