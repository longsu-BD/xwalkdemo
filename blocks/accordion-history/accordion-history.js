/*
 * Accordion History Block
 * Decade-keyed expand/collapse rows.
 * Based on the EDS block-collection accordion.
 * https://www.hlx.live/developer/block-collection/accordion
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * loads and decorates the accordion-history block
 *
 * Content contract (collection model): each row has two cells — cell 1 is the
 * summary label (e.g. a decade), cell 2 is the collapsible body.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-history-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-history-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-history-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
