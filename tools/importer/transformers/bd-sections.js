/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: BD (bd.com) section breaks + section metadata.
 * Inserts an <hr> before every non-first section from page-templates.json and,
 * for sections that declare a `style`, a Section Metadata block.
 *
 * Sections for template about-bd-3 (all style: null → no metadata blocks):
 *   rc1 hero            → .bd-spotlight-new / .bd-spotlight__container
 *   rc2 tabbed-content  → .bd-tabs / .bd-tabs.tabs.panelcontainer
 *   rc3 xf-chrome        → .bd-experiencefragment / .experiencefragment
 * Selectors verified against migration-work/cleaned.html.
 *
 * Break insertion runs in beforeTransform (while every section element still
 * exists — parsers run between hooks and may replaceWith() section elements);
 * metadata insertion runs in afterTransform, anchored to a marker <hr>.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// section.selector is an array of candidate selectors — try each in order, first match wins.
function querySection(root, selectors) {
  for (const sel of selectors) {
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue; // no selector matched on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
