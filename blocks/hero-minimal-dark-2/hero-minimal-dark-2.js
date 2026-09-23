import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Hero — minimal dark, compact text + icon variant.
 * A small avatar/icon beside a heading with supporting text (e.g. a comment or
 * author intro). Forked from the base hero; targets its own class.
 */
export default function decorate(block) {
  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]),
    );
  });

  const media = document.createElement('div');
  media.className = 'hero-minimal-dark-2-media';
  const content = document.createElement('div');
  content.className = 'hero-minimal-dark-2-content';

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
  if (media.childElementCount) block.append(media);
  block.append(content);
}
