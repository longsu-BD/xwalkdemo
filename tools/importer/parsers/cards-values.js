/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-values. Base: cards (container block).
 * Source: https://www.bd.com/en-us/about-bd/our-company
 *   (.bd-value-list__container / .bd-values-mission-list)
 * Item model (cards-values-item): image (reference), imageAlt (collapsed -> alt attr),
 *   text (richtext).
 * Structure: 2 columns. Row 1 = block name. Each value card = one row:
 *   cell 1 -> field:image (icon), cell 2 -> field:text (description).
 */
export default function parse(element, { document }) {
  // Each value card. Fall back to per-content wrappers if the card container class varies.
  let cards = Array.from(element.querySelectorAll('.bd-value-list__card-container'));
  if (cards.length === 0) {
    cards = Array.from(element.querySelectorAll('.bd-value-list__content'));
  }

  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const icon = card.querySelector('img.bd-value-list__icon, img');
    const description = card.querySelector('.bd-value-list__description, [class*="description"]');

    // --- cell 1: icon image ---
    const imageCell = document.createDocumentFragment();
    if (icon) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(icon);
    }

    // --- cell 2: text ---
    const textCell = document.createDocumentFragment();
    if (description) {
      textCell.appendChild(document.createComment(' field:text '));
      textCell.appendChild(description);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-values', cells });
  element.replaceWith(block);
}
