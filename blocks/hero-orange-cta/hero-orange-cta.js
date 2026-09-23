/*
 * Hero — orange CTA band variant.
 * A full-bleed solid-color band with a centered heading, a primary CTA button,
 * and a supporting link line. Forked from base hero; targets its own class.
 */
export default function decorate(block) {
  const content = document.createElement('div');
  content.className = 'hero-orange-cta-content';
  [...block.children].forEach((row) => {
    while (row.firstElementChild) content.append(row.firstElementChild);
    row.remove();
  });

  // Treat the first link as the primary CTA (pill button).
  const firstLink = content.querySelector('a');
  if (firstLink) firstLink.classList.add('hero-orange-cta-button');

  block.append(content);
}
