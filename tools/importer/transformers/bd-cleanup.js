/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: BD (bd.com) site-wide cleanup.
 * Removes non-authorable global chrome and third-party widgets so the import
 * contains only page-level authorable content (hero + tabbed content).
 * All selectors verified against migration-work/cleaned.html.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Third-party overlays / consent widgets that could block or pollute parsing.
    WebImporter.DOMUtils.remove(element, [
      '.uwy',                    // UserWay accessibility widget (cleaned.html line 2)
      '#onetrust-consent-sdk',   // OneTrust cookie consent SDK (cleaned.html line 3792)
      'iframe',                  // GPP Locator iframe + UserWay iframe (cleaned.html lines 26, 3790)
      '#bd-form-data-collection',// Adobe form data collection placeholder (cleaned.html line 3788)
      '#popup_video_modal',      // hidden video modal placeholder (cleaned.html line 50)
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site shell chrome: header + footer experience fragments.
    // Both header (cleaned.html line 44) and footer (line 3589) render as
    // .bd-experiencefragment; they wrap <header>, <nav>, <footer>, social/legal
    // links, and consent markup — none of which authors create per-page.
    WebImporter.DOMUtils.remove(element, [
      '.bd-experiencefragment',  // header + footer experience-fragment chrome
      'header.bd-header',        // site header (cleaned.html line 52)
      'footer.bd-footer',        // site footer (cleaned.html line 3595)
      'nav#navigation',          // main navigation (cleaned.html line 54)
      'link',                    // stray <link> tags (cleaned.html line 3770)
      'noscript',
    ]);
  }
}
