/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-segment. Base: cards (container block).
 * Source: https://www.bd.com/en-us/about-bd/our-company (.consolidated-image-card)
 * Item model (cards-segment-item): image (reference), imageAlt (collapsed -> alt attr),
 *   text (richtext).
 * Structure: 2 columns. Row 1 = block name. Each media card = one row:
 *   cell 1 -> field:image, cell 2 -> field:text (heading + details/richtext).
 * Note: each .consolidated-image-card instance is a single media card.
 */
export default function parse(element, { document }) {
  // A single .consolidated-image-card is itself one card. Support multiple if wrapped.
  let cards = Array.from(element.querySelectorAll('.bd-image-card__wrapper'));
  if (cards.length === 0) cards = [element];

  const cells = [];

  cards.forEach((card) => {
    const image = card.querySelector('.bd-image-card__image, .image-withoutstyle img, img');
    const heading = card.querySelector('.bd-image-card__heading');
    const details = card.querySelector('.bd-image-card__details');
    const content = card.querySelector('.bd-image-card__content');

    // --- cell 1: image ---
    const imageCell = document.createDocumentFragment();
    if (image) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(image);
    }

    // --- cell 2: text (heading + body) ---
    const textCell = document.createDocumentFragment();
    let hasText = false;
    if (heading || details) {
      textCell.appendChild(document.createComment(' field:text '));
      if (heading) { textCell.appendChild(heading); hasText = true; }
      if (details) { textCell.appendChild(details); hasText = true; }
    } else if (content) {
      // Fallback: take the whole content block minus the image.
      textCell.appendChild(document.createComment(' field:text '));
      Array.from(content.childNodes).forEach((node) => textCell.appendChild(node));
      hasText = true;
    }

    // Only push a card row if it has some content.
    if (image || hasText) {
      cells.push([imageCell, textCell]);
    }
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-segment', cells });
  element.replaceWith(block);
}
