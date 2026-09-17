/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-about. Base: tabs (container block).
 * Source: https://www.bd.com/en-us/about-bd/our-company (.bd-tabs)
 * Item model (tabs-about-item): title, content_heading, content_headingType (collapsed),
 *   content_image (reference), content_richtext (richtext).
 * Structure: 2 columns. Row 1 = block name. Each tab = one row:
 *   cell 1 -> field:title (tab label), cell 2 -> content_ group (heading + image + richtext).
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
      // Move the panel's children into the content cell, preserving semantic HTML.
      Array.from(panel.childNodes).forEach((node) => contentCell.appendChild(node));
    }

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-about', cells });
  element.replaceWith(block);
}
