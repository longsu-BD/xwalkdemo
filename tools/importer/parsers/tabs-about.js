/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-about. Base: tabs (container block).
 * Source: https://www.bd.com/en-us/about-bd/our-company (.bd-tabs)
 * Item model (tabs-about-item): title, content_heading, content_headingType (collapsed),
 *   content_image (reference), content_richtext (richtext).
 * Structure: 2 columns. Row 1 = block name. Each tab = one row:
 *   cell 1 -> field:title (tab label), cell 2 -> content_ group (heading + image + richtext).
 *
 * md2jcr note: the panel body maps to content_richtext and contains NESTED block-tables
 * (cards-values, accordion-history, carousel-honors, cards-segment, cards-profile) that
 * must survive as rich content — they are hydrated into real blocks at runtime by
 * blocks/tabs-about/tabs-about.js. md2jcr's richtext reader consumes the FIRST node in a
 * cell unconditionally, then greedily absorbs following siblings until it hits one that
 * contains an image (or a field hint). Because these panels contain multiple nested tables
 * whose cells hold images, every nested table after the first is left orphaned with no
 * model field to map to, and md2jcr throws ("every field must align with a column"). To
 * avoid this the entire panel body is wrapped in a single <blockquote> element: it becomes
 * one markdown block node, so the richtext reader swallows it (and all nested tables)
 * whole. Runtime hydration is unaffected — tabs-about.js queries `.tabs-about-panel table`,
 * which still matches tables nested inside the blockquote.
 */
export default function parse(element, { document }) {
  // Tab labels
  const tabItems = Array.from(element.querySelectorAll('.cmp-tabs__tab, li.cmp-tabs__tabitem'));
  // Tab panels
  const panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  if (tabItems.length === 0 || panels.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  tabItems.forEach((tab, i) => {
    // Match panel by id when possible, otherwise fall back to positional index.
    const tabId = tab.getAttribute('id');
    let panel = null;
    if (tabId) {
      panel = panels.find((p) => p.getAttribute('id') === tabId) || null;
    }
    if (!panel) panel = panels[i] || null;

    // --- cell 1: tab title ---
    const titleCell = document.createDocumentFragment();
    titleCell.appendChild(document.createComment(' field:title '));
    const label = document.createElement('p');
    label.textContent = (tab.textContent || '').trim();
    titleCell.appendChild(label);

    // --- cell 2: content group (content_richtext holds the panel body) ---
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(' field:content_richtext '));
    if (panel) {
      // Wrap the entire panel body in a single <blockquote>. md2jcr's richtext reader
      // greedily absorbs a cell's nodes but stops at the first sibling containing an
      // image, orphaning every image-bearing nested block-table after the first and
      // failing conversion. Collapsing everything into one block node makes the reader
      // swallow the whole panel (nested tables included) in a single pass. Runtime
      // hydration is unaffected: tabs-about.js selects `.tabs-about-panel table`, which
      // still matches the tables nested inside the blockquote.
      const wrapper = document.createElement('blockquote');
      Array.from(panel.childNodes).forEach((node) => wrapper.appendChild(node));
      contentCell.appendChild(wrapper);
    }

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-about', cells });
  element.replaceWith(block);
}
