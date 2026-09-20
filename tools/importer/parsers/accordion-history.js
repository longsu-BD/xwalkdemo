/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-history. Base: accordion (container block).
 * Source: https://www.bd.com/en-us/about-bd/our-company
 *   (.accordion.panelcontainer / .bd-accordian-faq)
 * Item model (accordion-history-item): summary (text), text (richtext).
 * Structure: 2 columns. Row 1 = block name. Each accordion item = one row:
 *   cell 1 -> field:summary (title), cell 2 -> field:text (panel body).
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-accordion__item'));

  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const title = item.querySelector('.cmp-accordion__title, .cmp-accordion__button');
    const panel = item.querySelector('.cmp-accordion__panel');

    // --- cell 1: summary ---
    const summaryCell = document.createDocumentFragment();
    summaryCell.appendChild(document.createComment(' field:summary '));
    const summaryEl = document.createElement('p');
    summaryEl.textContent = title ? (title.textContent || '').trim() : '';
    summaryCell.appendChild(summaryEl);

    // --- cell 2: panel body richtext ---
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (panel) {
      Array.from(panel.childNodes).forEach((node) => textCell.appendChild(node));
    }

    cells.push([summaryCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-history', cells });
  element.replaceWith(block);
}
