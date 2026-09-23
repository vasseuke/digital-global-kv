/*
 * Accordion — FAQ variant.
 * Renders each row as an expand/collapse Q&A item (question summary + answer body).
 * Forked from the base accordion; targets its own class.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate FAQ item label (question)
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    if (label) summary.append(...label.childNodes);
    // decorate FAQ item body (answer)
    const body = row.children[1] || document.createElement('div');
    body.className = 'accordion-faq-item-body';
    // decorate FAQ item
    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
