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
 *
 * md2jcr note: content_text is a richtext field. md2jcr's richtext consumption is
 * greedy but stops at any node that contains an image, leaving that node with no
 * remaining field to map to — which makes md2jcr throw ("every field must align
 * with a column"). The only images that ever appear in these slides are decorative
 * "Learn more" arrow icons (alt="") duplicating the adjacent text link, so they are
 * stripped from the content cell. Real slide artwork (if any) belongs in cell 1
 * (field:media_image), never inside the content_text richtext.
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
    // Only a real slide image in .bd-content-card__image is eligible. We must NOT
    // fall back to any <img> in the card, because the only images in these slides
    // are decorative "Learn more" arrow icons living inside .bd-content-card__card-details;
    // promoting one of those into media_image both mis-maps the field and re-introduces
    // the very image node that breaks md2jcr's richtext mapping.
    const image = slide.querySelector('.bd-content-card__image img');

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

      // content_text is a richtext field. md2jcr's richtext reader is greedy but
      // stops at the first node that contains an image, orphaning it (no field left
      // to map to) and failing conversion.
      //
      // These slides carry a decorative "Learn more" arrow that is NOT an <img> in
      // the source — it is a <span class="bd-content-card__learn-more-arrow"> whose
      // icon comes from an inline `background-image` style. WebImporter/html2md turns
      // any element with a background-image into a markdown image during conversion,
      // so that span becomes an <img> in the generated markdown and breaks md2jcr.
      // Strip these decorative markers from the content cell:
      //   1. the arrow span (and any element carrying an inline background-image),
      //   2. any literal <img>/<picture> (defensive — real slides shouldn't have them
      //      inside content_text; artwork belongs in cell 1 / media_image),
      // keeping the "Learn more" anchor text/href intact as the real CTA. Finally
      // prune anchors/paragraphs left empty by the removals.
      const scratch = document.createElement('div');
      Array.from(textCell.childNodes).forEach((n) => scratch.appendChild(n));
      scratch.querySelectorAll('.bd-content-card__learn-more-arrow, [style*="background-image"], img, picture').forEach((el) => {
        el.remove();
      });
      scratch.querySelectorAll('a').forEach((a) => {
        if (!a.textContent.trim() && !a.querySelector('img, picture')) a.remove();
      });
      scratch.querySelectorAll('p').forEach((p) => {
        if (!p.textContent.trim() && !p.querySelector('a, img, picture')) p.remove();
      });
      Array.from(scratch.childNodes).forEach((n) => textCell.appendChild(n));
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
