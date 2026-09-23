import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Hero — minimal dark, split image + content variant.
 * Two-column layout: product imagery on one side, heading/text/CTAs on the other.
 * Forked from the base hero; targets its own class and option classes.
 */
const OPTION_CLASSES = ['minimal-dark-withimg', 'minimal-dark-withimg-2'];

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]),
    );
  });

  const rows = [...block.children];
  const media = document.createElement('div');
  media.className = 'hero-minimal-dark-withimg-media';
  const content = document.createElement('div');
  content.className = 'hero-minimal-dark-withimg-content';

  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture, img') && !cell.querySelector('h1, h2, h3, p')) {
        media.append(...cell.childNodes);
      } else if (cell.querySelector('picture, img')) {
        // Mixed cell: keep imagery in media, text in content.
        cell.querySelectorAll('picture, img').forEach((el) => media.append(el));
        content.append(...cell.childNodes);
      } else {
        content.append(...cell.childNodes);
      }
    });
    row.remove();
  });

  block.textContent = '';
  if (media.childElementCount) block.append(media);
  block.append(content);

  // '-2' option flips the media/content order for the alternate layout.
  if (active.includes('minimal-dark-withimg-2')) {
    block.classList.add('hero-minimal-dark-withimg-reverse');
  }
}
