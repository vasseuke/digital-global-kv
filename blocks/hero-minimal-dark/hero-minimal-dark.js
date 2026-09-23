import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Hero — minimal dark, background image variant.
 * Overlays a centered content card (icon, heading, meta, description) on a
 * full-bleed background image. Forked from the base hero; targets its own class.
 */
export default function decorate(block) {
  block.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]),
    );
  });

  // The last picture (if any) becomes the background; remaining content is the card.
  const pictures = block.querySelectorAll('picture');
  const bg = pictures.length ? pictures[pictures.length - 1] : null;
  if (bg) {
    const bgWrapper = document.createElement('div');
    bgWrapper.className = 'hero-minimal-dark-bg';
    bgWrapper.append(bg);
    block.prepend(bgWrapper);
  }

  const content = document.createElement('div');
  content.className = 'hero-minimal-dark-content';
  [...block.children].forEach((child) => {
    if (child.classList.contains('hero-minimal-dark-bg')) return;
    while (child.firstElementChild) content.append(child.firstElementChild);
    child.remove();
  });
  block.append(content);
}
