import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';

/*
 * Hero — minimal dark (recipe detail).
 * Full-bleed food photograph background with a centered white content card
 * (pink whisk icon, pink uppercase title, dark time/serves meta, description).
 *
 * Source markup carries no inline image or icon: the background photo comes
 * from the page's `Image` metadata and the whisk icon is a fixed brand asset.
 */
export default function decorate(block) {
  // Any authored pictures act as the background; otherwise fall back to page metadata.
  const authoredPics = [...block.querySelectorAll('picture')];
  let bgPicture = authoredPics.length ? authoredPics[authoredPics.length - 1] : null;
  if (bgPicture) {
    const img = bgPicture.querySelector('img');
    if (img) {
      // Above-the-fold hero: load the background eagerly.
      const optimized = createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]);
      bgPicture.replaceWith(optimized);
      bgPicture = optimized;
    }
  } else {
    // Prefer the authored "Image" metadata (recipe photo); the lowercase
    // image/og:image are EDS-generated and may point to the first content image.
    const metaImg = getMetadata('Image') || getMetadata('image') || getMetadata('og:image');
    if (metaImg) {
      bgPicture = createOptimizedPicture(metaImg, '', true, [{ width: '2000' }]);
    }
  }

  // Background layer.
  const bg = document.createElement('div');
  bg.className = 'hero-minimal-dark-bg';
  if (bgPicture) bg.append(bgPicture);

  // Content card: move all remaining authored content into it.
  const content = document.createElement('div');
  content.className = 'hero-minimal-dark-content';
  [...block.children].forEach((child) => {
    while (child.firstElementChild) content.append(child.firstElementChild);
    child.remove();
  });

  // Whisk brand icon at the top of the card.
  const icon = document.createElement('span');
  icon.className = 'hero-minimal-dark-icon';
  const iconImg = document.createElement('img');
  iconImg.src = new URL('./recipe-icon.svg', import.meta.url).href;
  iconImg.alt = '';
  iconImg.setAttribute('aria-hidden', 'true');
  iconImg.width = 104;
  iconImg.height = 104;
  iconImg.loading = 'eager';
  icon.append(iconImg);

  // Style the meta line (first paragraph after the heading): split "10 MinutesServes 1"
  // into individual spans so the "|" divider can be rendered via CSS.
  const heading = content.querySelector('h1, h2, h3');
  const meta = heading ? heading.nextElementSibling : content.querySelector('p');
  if (meta && meta.tagName === 'P') {
    meta.classList.add('hero-minimal-dark-meta');
    const raw = meta.textContent.trim();
    const match = raw.match(/^(.*?minutes?)\s*(serves.*)$/i);
    if (match) {
      meta.textContent = '';
      const s1 = document.createElement('span');
      s1.textContent = match[1].trim();
      const s2 = document.createElement('span');
      s2.textContent = match[2].trim();
      meta.append(s1, s2);
    }
  }

  block.prepend(content);
  block.prepend(bg);
  content.prepend(icon);
}
