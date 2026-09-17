import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the hero-spotlight block
 *
 * Content contract (standalone model, forked from `hero`):
 *   row 1 → background image (+ optional alt)
 *   row 2 → heading / text (rendered in the foreground colored panel)
 *
 * The block renders the heading inside a foreground panel layered over a
 * full-bleed background picture. Structural only — brand colors, the panel
 * shape and the corner accent are applied by the design pass.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // First picture anywhere in the block is the background image.
  const picture = block.querySelector('picture');

  // Separate the foreground text rows (rows without an image) from the image row.
  const contentRows = rows.filter((row) => !row.querySelector('picture, img') && row.textContent.trim());

  // Build the background layer, re-optimizing the picture for a full-bleed hero.
  const bg = document.createElement('div');
  bg.className = 'hero-spotlight-bg';
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]);
      bg.append(optimized);
    } else {
      bg.append(picture);
    }
  }

  // Build the foreground panel holding the heading / text.
  const panel = document.createElement('div');
  panel.className = 'hero-spotlight-panel';
  contentRows.forEach((row) => {
    // unwrap a single wrapping cell so headings sit directly in the panel
    const cell = row.children.length === 1 ? row.firstElementChild : row;
    [...cell.childNodes].forEach((node) => panel.append(node));
  });

  block.textContent = '';
  if (picture) block.append(bg);
  block.append(panel);
}
