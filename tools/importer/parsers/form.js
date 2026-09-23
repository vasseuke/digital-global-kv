/* eslint-disable */
/* global WebImporter */
/**
 * Parser for form
 * Base block: form
 * Source: https://www.dunkincreamer.com/contact-us/ (section.formcontainer-section form)
 *         also reused for blog-post comment form (form#commentform)
 * Generated: 2026-09-23
 *
 * Block model (custom `form`, Document Authoring):
 *   Single-column block table. First row = block name.
 *   Intro rows (no form controls): heading + descriptive copy — the block groups
 *     every control-less row into an intro area at the top.
 *   Field rows (contain a control): each row is one cell holding the label/heading
 *     text plus the native control(s) (checkbox, input, select, textarea, submit).
 *
 * Extraction strategy (validated against source.html):
 *   - Intro copy lives OUTSIDE the <form> in `.form_title` (h2) and
 *     `.form_description` (paragraphs) → emitted first as intro rows.
 *   - Inside the form, content is grouped in `.col-row` blocks. Control-less
 *     `.col-row`s are section headings (`.contheading` h3/h4) — they are merged
 *     into the FOLLOWING field row so they stay adjacent to their fields.
 *   - reCAPTCHA `.col-row`s (formrecaptcha / g-recaptcha) are skipped.
 *   - The submit control lives in `.btn-wrapper` (outside any `.col-row`) and is
 *     appended as the final field row.
 *   - Fallback (e.g. WP comment form with no `.col-row`s): iterate the controls
 *     directly, pairing each with its associated <label>.
 */
export default function parse(element, { document }) {
  // Resolve the form and a scope that also contains the intro copy.
  const form = element.matches('form') ? element : element.querySelector('form');
  const scope = element.matches('form')
    ? (element.closest('.formcontainer, .formcontainer-section, section') || element)
    : element;

  const cells = [];

  // --- Intro rows (heading + description), pulled from outside the form. ---
  const intro = [];
  const title = scope.querySelector('.form_title h2, .form_title h1, .form_title h3');
  if (title) intro.push(title);
  const desc = scope.querySelector('.form_description');
  if (desc) {
    Array.from(desc.querySelectorAll('p')).forEach((p) => intro.push(p));
  }
  // Comment-form style intro title.
  const commentTitle = scope.querySelector('.comment-reply-title, #reply-title');
  if (!title && commentTitle) intro.push(commentTitle);
  if (intro.length) cells.push([intro]);

  const isNoise = (el) => !!el.closest('.formrecaptcha, .g-recaptcha, .wpcf7-recaptcha')
    || (el.id && el.id === 'g-recaptcha-response');

  const collectFieldCell = (nodes) => {
    const cell = [];
    nodes.forEach((n) => cell.push(n));
    return cell;
  };

  if (form) {
    // Field groups: prefer the contact-form `.col-row` grouping; fall back to the
    // form's direct `<p>`/`<div>`/`<fieldset>` children (WP comment form wraps
    // each label+control in a `<p class="comment-form-*">`).
    let groups = Array.from(form.querySelectorAll(':scope .col-row'));
    if (!groups.length) {
      groups = Array.from(form.children)
        .filter((c) => /^(P|DIV|FIELDSET)$/.test(c.tagName));
    }
    groups = groups.filter((g) => !g.querySelector('.formrecaptcha, .g-recaptcha, #g-recaptcha-response'));

    let pending = [];
    groups.forEach((g) => {
      const hasControl = !!g.querySelector('input, select, textarea');
      if (!hasControl) {
        // Section heading / label-only / notes row — hold to merge with the
        // following field row (or emit on its own if none follows).
        if (g.textContent.trim()) pending.push(g);
        return;
      }
      const cell = collectFieldCell([...pending, g]);
      pending = [];
      if (cell.length) cells.push([cell]);
    });
    // Any trailing heading/notes with no following field still gets emitted.
    if (pending.length) cells.push([collectFieldCell(pending)]);

    // Submit control that lives OUTSIDE the grouped rows (contact form keeps it
    // in `.btn-wrapper`). Only add it if it wasn't already captured in a group.
    const submit = form.querySelector('.btn-wrapper input, input.submit, input[id="Sendmessage"], input[type="submit"], button[type="submit"]');
    if (submit && !isNoise(submit) && !groups.some((g) => g.contains(submit))) {
      cells.push([[submit]]);
    }
  }

  // Empty-block guard: nothing usable extracted.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
