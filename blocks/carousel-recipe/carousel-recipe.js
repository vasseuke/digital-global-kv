import { fetchPlaceholders, createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Carousel — recipe card variant.
 * A horizontal slider of recipe cards (photo + title + time/serves metadata)
 * with paging dots. Forked from the base carousel; targets its own class.
 */
function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-recipe-slide');
  let realIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realIndex = 0;
  const active = slides[realIndex];
  block.dataset.activeSlide = realIndex;
  block.querySelector('.carousel-recipe-slides').scrollTo({
    top: 0,
    left: active.offsetLeft,
    behavior: 'smooth',
  });
  block.querySelectorAll('.carousel-recipe-indicator button').forEach((b, i) => {
    b.toggleAttribute('disabled', i === realIndex);
    if (i === realIndex) b.setAttribute('aria-current', 'true');
    else b.removeAttribute('aria-current');
  });
}

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders();
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carouselLabel || 'Carousel');

  const rows = [...block.children];
  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-recipe-slides';

  rows.forEach((row, idx) => {
    const slide = document.createElement('li');
    slide.className = 'carousel-recipe-slide';
    slide.dataset.slideIndex = idx;
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      if (cell.querySelector('picture, img')) cell.classList.add('carousel-recipe-slide-image');
      else cell.classList.add('carousel-recipe-slide-body');
      slide.append(cell);
    }
    slidesWrapper.append(slide);
    row.remove();
  });

  slidesWrapper.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  block.append(slidesWrapper);

  const slideCount = slidesWrapper.children.length;
  if (slideCount > 1) {
    const nav = document.createElement('nav');
    nav.className = 'carousel-recipe-indicators';
    nav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slidesWrapper.querySelectorAll('.carousel-recipe-slide').forEach((_, idx) => {
      const li = document.createElement('span');
      li.className = 'carousel-recipe-indicator';
      li.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1}"></button>`;
      li.querySelector('button').addEventListener('click', () => showSlide(block, idx));
      nav.append(li);
    });
    block.append(nav);
    showSlide(block, 0);
  }
}
