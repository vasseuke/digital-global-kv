/*
 * Form Block
 * Wraps authored intro content and form controls into an accessible <form>.
 * Structural only — no brand styling. Tolerates authors omitting rows.
 */

function decorateIntro(rows) {
  const intro = document.createElement('div');
  intro.className = 'form-intro';
  rows.forEach((row) => {
    while (row.firstElementChild) intro.append(row.firstElementChild);
  });
  return intro;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Collect any native form controls the author may have added.
  const controls = block.querySelectorAll('input, textarea, select, button');

  const form = document.createElement('form');
  form.className = 'form-fields';
  form.setAttribute('novalidate', '');

  // First rows without controls are treated as intro copy (heading/text/links).
  const introRows = rows.filter((row) => !row.querySelector('input, textarea, select, button'));
  const fieldRows = rows.filter((row) => row.querySelector('input, textarea, select, button'));

  const intro = decorateIntro(introRows);

  fieldRows.forEach((row) => {
    const field = document.createElement('div');
    field.className = 'form-field';
    while (row.firstElementChild) field.append(row.firstElementChild);
    // Group a checkbox/radio with its adjacent label text for alignment.
    if (field.querySelector('input[type="checkbox"], input[type="radio"]')) {
      field.classList.add('form-field-choice');
    }
    form.append(field);
  });

  // If no explicit submit control was authored, add one so the form is usable.
  if (fieldRows.length && !form.querySelector('button, input[type="submit"]')) {
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'form-submit';
    submit.textContent = 'Submit';
    form.append(submit);
  }

  block.textContent = '';
  if (intro.childElementCount) block.append(intro);
  if (form.childElementCount) block.append(form);

  // Prevent a broken navigation if the form has no real action.
  form.addEventListener('submit', (e) => {
    if (!form.getAttribute('action')) e.preventDefault();
  });

  // Keep reference to controls for potential enhancement without failing when absent.
  if (!controls.length && !intro.childElementCount) {
    block.append(form);
  }
}
