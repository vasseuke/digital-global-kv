/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq
 * Base block: accordion
 * Source: https://www.dunkincreamer.com/learn-more/faqs/ (section.expander, repeated)
 * Generated: 2026-09-23
 *
 * Library structure (Accordion): 2 columns, multiple rows.
 *   Row 1: block name.
 *   Each subsequent row = one accordion item:
 *     Cell 1: title/label (the clickable question).
 *     Cell 2: content (the answer body — text, links, media).
 *
 * Source structure (validated against faqs cleaned.html):
 *   Many sibling `section.expander` elements share a common container
 *   (`.faq_width`), with plain `.text.theading` category dividers between groups.
 *   Each expander:
 *     .expander__headline > .expander__headline-heading (question)
 *     .expander__content  > .text-section .text.dtext    (answer)
 *
 * Per-instance invocation handling:
 *   The import selector (`section.expander`) matches every item, so parse() is
 *   invoked once per expander. To emit a SINGLE accordion block containing every
 *   Q&A row, the first (still-connected) expander gathers all sibling expanders,
 *   builds the whole block, replaces itself with it, and removes the siblings.
 *   Subsequent invocations receive now-disconnected elements and bail out.
 */
export default function parse(element, { document }) {
  // Already absorbed by a previous invocation.
  if (!element.isConnected) return;

  // Resolve the container that holds all sibling expanders.
  const container = element.closest('.faq_width, main.page-main, section:not(.expander), body')
    || element.parentElement
    || element;

  // Top-level expanders only (guard against any nesting).
  let expanders = Array.from(container.querySelectorAll('section.expander'))
    .filter((ex) => {
      const p = ex.parentElement;
      return !(p && p.closest && p.closest('section.expander'));
    });
  if (!expanders.length) expanders = [element];

  // Only the first expander builds the block; others bail.
  if (expanders[0] !== element) {
    return;
  }

  const buildQuestion = (ex) => {
    const h = ex.querySelector('.expander__headline-heading, .expander__headline h1, .expander__headline h2, .expander__headline h3, h3, h2');
    if (h && h.textContent.trim()) {
      // Preserve as a heading for accordion title semantics.
      const el = document.createElement('h3');
      el.innerHTML = h.innerHTML;
      return el;
    }
    return null;
  };

  const buildAnswer = (ex) => {
    const content = ex.querySelector('.expander__content');
    if (!content) return null;
    // Prefer the inner text body; keep links/markup intact.
    const body = content.querySelector('.text.dtext, .text, .text-section') || content;
    const nodes = Array.from(body.childNodes).filter((n) => {
      if (n.nodeType === 1) return true;
      if (n.nodeType === 3) return n.textContent.trim().length > 0;
      return false;
    });
    return nodes.length ? nodes : [body];
  };

  const cells = [];
  expanders.forEach((ex) => {
    const q = buildQuestion(ex);
    const a = buildAnswer(ex);
    if (q || a) {
      cells.push([q || '', a || '']);
    }
  });

  // Empty-block guard.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  // Replace the first expander with the full accordion, remove the rest.
  element.replaceWith(block);
  expanders.slice(1).forEach((ex) => ex.remove());
}
