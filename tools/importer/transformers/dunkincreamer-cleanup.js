/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: dunkincreamer site-wide cleanup.
 * Removes non-authorable site chrome (nav, mobile menu, footer, cookie banner,
 * promo modal, AudioEye accessibility widget, tracking beacons/iframes).
 * All selectors verified against migration-work/cleaned.html.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / modals / consent that would interfere with block parsing.
    WebImporter.DOMUtils.remove(element, [
      '#tc-privacy-wrapper',        // cookie/privacy banner (cleaned.html line 709)
      '.popup-wrapper',             // promo modal overlay #popup (line 567)
      '#ae_enabled_site',           // AudioEye blurb (line 3)
      '.audioeye-skip-link',        // AudioEye skip link (line 2)
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome and leftover tracking/technical elements.
    WebImporter.DOMUtils.remove(element, [
      'header#header',                // main site header/nav (line 11)
      '#mobile-menu',                 // slide-out mobile menu (line 89)
      'footer.page-footer',           // site footer (line 605)
      '#ae_app',                      // AudioEye app container (line 725)
      '#ae_launcher',                 // AudioEye launcher aside (line 749)
      '#batBeacon984915460148',       // Bing tracking beacon (line 722)
      'iframe',                       // doubleclick activity iframe (line 707)
      'link',                         // stray stylesheet link (line 702)
      'noscript',
    ]);
  }
}
