/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-honors. Base: carousel (container block).
 * Source: https://www.bd.com/en-us/about-bd/our-company
 *   (.bd-custom-carousel / .bd-carousel-outer-container)
 * Item model (carousel-honors-item): media_image (reference), media_imageAlt (collapsed),
 *   content_text (richtext).
 * Structure: 2 columns. Row 1 = block name. Each slide = one row:
 *   cell 1 -> field:media_image (slide image, empty when none), cell 2 -> field:content_text.
 * Note: this is a Slick carousel — .slick-cloned slides are duplicates and are excluded.
 */
export default function parse(element, { document }) {
  // Real slides only — exclude Slick's cloned duplicates.
  let slides = Array.from(element.querySelectorAll('.cmp-carousel__item:not(.slick-cloned)'));
  if (slides.length === 0) {
    slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));
  }

  if (slides.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // De-duplicate by textual content (Slick can render several active/current copies).
  const seen = new Set();
  const cells = [];

  slides.forEach((slide) => {
    const key = (slide.textContent || '').replace(/\s+/g, ' ').trim();
    if (!key || seen.has(key)) return;
    seen.add(key);

    // Slide image (none present in current source, but support it defensively).
    const image = slide.querySelector('.bd-content-card__image img, .bd-content-card img, img');

    // Card content: tags, heading, body.
    const details = slide.querySelector('.bd-content-card__card-details, .bd-content-card__wrapper, .bd-content-card');

    // --- cell 1: image (leave empty when absent) ---
    const imageCell = document.createDocumentFragment();
    if (image) {
      imageCell.appendChild(document.createComment(' field:media_image '));
      imageCell.appendChild(image);
    }

    // --- cell 2: text content ---
    const textCell = document.createDocumentFragment();
    if (details) {
      textCell.appendChild(document.createComment(' field:content_text '));
      Array.from(details.childNodes).forEach((node) => textCell.appendChild(node.cloneNode(true)));
    }

    cells.push([imageCell, textCell]);
  });

  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-honors', cells });
  element.replaceWith(block);
}
