/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-spotlight. Base: hero.
 * Source: https://www.bd.com/en-us/about-bd/our-company (.bd-spotlight-new)
 * Model fields: image (reference), imageAlt (collapsed -> alt attr), text (richtext)
 * Structure: 1 column, up to 3 rows (name, background image, text).
 */
export default function parse(element, { document }) {
  // Background/spotlight image
  const image = element.querySelector('.bd-spotlight__image-box img, img[class*="image"], img');
  // Heading + any supporting copy from the left content container
  const heading = element.querySelector('.bd-spotlight-heading-html h1, .bd-spotlight-heading-html h2, h1, h2');
  const description = element.querySelector('.bd-spotlight__container-left__description-left p, [class*="description"] p');
  const ctaLinks = Array.from(element.querySelectorAll('.bd-spotlight__container-left a, [class*="container-left"] a'));

  // Empty-block guard
  if (!image && !heading && !description && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row: background image (field:image)
  if (image) {
    const imgFrag = document.createDocumentFragment();
    imgFrag.appendChild(document.createComment(' field:image '));
    imgFrag.appendChild(image);
    cells.push([imgFrag]);
  }

  // Row: text content (field:text) - heading + optional subheading + optional CTAs
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  let hasText = false;
  if (heading) { textFrag.appendChild(heading); hasText = true; }
  if (description) { textFrag.appendChild(description); hasText = true; }
  ctaLinks.forEach((a) => { textFrag.appendChild(a); hasText = true; });
  if (hasText) {
    cells.push([textFrag]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-spotlight', cells });
  element.replaceWith(block);
}
