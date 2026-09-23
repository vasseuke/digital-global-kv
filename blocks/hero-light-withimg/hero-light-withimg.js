import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Hero — light headline + product image variant.
 * A large display headline and short supporting copy alongside prominent
 * product imagery on a light background with a brand color band.
 * Forked from the base hero; targets its own class.
 */
export default function decorate(block) {
  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]),
    );
  });

  const content = document.createElement('div');
  content.className = 'hero-light-withimg-content';
  const media = document.createElement('div');
  media.className = 'hero-light-withimg-media';

  [...block.children].forEach((row) => {
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
