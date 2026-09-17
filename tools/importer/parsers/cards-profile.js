/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-profile. Base: cards (container block).
 * Source: https://www.bd.com/en-us/about-bd/our-company (.bd-content-card-list)
 * Item model (cards-profile-item): image (reference), imageAlt (collapsed -> alt attr),
 *   text (richtext -> name/title, linked).
 * Structure: 2 columns. Row 1 = block name. Each profile = one row:
 *   cell 1 -> field:image (headshot), cell 2 -> field:text (name link + role).
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('li.bd-content-card-list__card, .bd-content-card-list__card'));

  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const image = card.querySelector('.bd-content-card-list__img img, img');
    const heading = card.querySelector('.bd-content-card-list__heading');
    const description = card.querySelector('.bd-content-card-list__description');

    // --- cell 1: headshot image ---
    const imageCell = document.createDocumentFragment();
    if (image) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(image);
    }

    // --- cell 2: name (linked) + role ---
    const textCell = document.createDocumentFragment();
    let hasText = false;
    if (heading || description) {
      textCell.appendChild(document.createComment(' field:text '));
      if (heading) { textCell.appendChild(heading); hasText = true; }
      if (description) { textCell.appendChild(description); hasText = true; }
    }

    if (image || hasText) {
      cells.push([imageCell, textCell]);
    }
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });
  element.replaceWith(block);
}
