import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Hero — minimal dark, headline + product image variant (alternate split).
 * Large headline and supporting copy on one side, product imagery on the other.
 * Forked from the base hero; targets its own class and option classes.
 */
const OPTION_CLASSES = ['minimal-dark-withimg'];

export default function decorate(block) {
  // Read (and tolerate) folded option tokens without changing base behavior.
  [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]),
    );
  });

  const rows = [...block.children];
  const media = document.createElement('div');
  media.className = 'hero-minimal-dark-withimg-2-media';
  const content = document.createElement('div');
  content.className = 'hero-minimal-dark-withimg-2-content';

  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture, img')) {
        cell.querySelectorAll('picture, img').forEach((el) => media.append(el));
        if (cell.textContent.trim()) content.append(...cell.childNodes);
      } else {
        content.append(...cell.childNodes);
      }
    });
    row.remove();
  });

  block.textContent = '';
  block.append(content);
  if (media.childElementCount) block.append(media);
}
