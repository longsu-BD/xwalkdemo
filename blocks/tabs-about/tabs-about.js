// eslint-disable-next-line import/no-unresolved
import { moveInstrumentation } from '../../scripts/scripts.js';
// eslint-disable-next-line import/no-unresolved
import { loadCSS } from '../../scripts/aem.js';

// keep track globally of the number of tab blocks on the page
let tabBlockCnt = 0;

/**
 * Converts a block-table (the markup EDS uses for authored blocks:
 * <table><thead><th>Block Name</th></thead><tbody><tr><td>…</td></tr></tbody></table>)
 * into a decorated, loaded EDS block element in place.
 *
 * EDS only auto-blocks tables at the top level of a section, so block-tables that
 * were authored INSIDE another block (here, inside a tab panel) are never turned
 * into blocks. This rebuilds them into the standard block DOM and loads their
 * JS/CSS, so nested cards/accordion/carousel render as real blocks (and their
 * decorate() runs createOptimizedPicture → lazy-loaded, responsive images).
 *
 * aem.js's buildBlock/decorateBlock/loadBlock are not exported, so the minimal
 * equivalents are inlined here; loadCSS is exported and reused.
 *
 * @param {HTMLTableElement} table the block-table to convert
 * @returns {Promise<void>} resolves once the nested block's module has run
 */
async function hydrateNestedBlock(table) {
  const nameCell = table.querySelector('thead th, thead td');
  if (!nameCell) return;
  const blockName = nameCell.textContent.trim().toLowerCase().replace(/\s+/g, '-');
  if (!blockName) return;

  // Build the block DOM: one div per <tr>, one div per <td>.
  const blockEl = document.createElement('div');
  blockEl.className = blockName;
  table.querySelectorAll('tbody > tr').forEach((tr) => {
    const rowEl = document.createElement('div');
    moveInstrumentation(tr, rowEl);
    [...tr.children].forEach((td) => {
      const cellEl = document.createElement('div');
      while (td.firstChild) cellEl.append(td.firstChild);
      rowEl.append(cellEl);
    });
    blockEl.append(rowEl);
  });

  // Wrap so decorate()/CSS that reference the block wrapper behave normally.
  const wrapper = document.createElement('div');
  wrapper.className = `${blockName}-wrapper`;
  wrapper.append(blockEl);
  table.replaceWith(wrapper);

  // Minimal decorateBlock (aem.js equivalent — not exported).
  blockEl.classList.add('block');
  blockEl.dataset.blockName = blockName;
  blockEl.dataset.blockStatus = 'loading';

  // Minimal loadBlock: load CSS + run the block's default export.
  try {
    const cssLoaded = loadCSS(`${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.css`);
    const decorated = (async () => {
      try {
        const mod = await import(`${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.js`);
        if (mod.default) await mod.default(blockEl);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`failed to load nested block ${blockName}`, error);
      }
    })();
    await Promise.all([cssLoaded, decorated]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`failed to load nested block ${blockName}`, error);
  }
  blockEl.dataset.blockStatus = 'loaded';
}

/**
 * loads and decorates the tabs-about block
 *
 * Content contract (collection model): each row is a tab — the first cell is the
 * tab title, the remaining cell(s) are the panel content. Renders a tablist plus
 * one panel per row, with the first panel visible by default. Any block-tables
 * authored inside a panel are hydrated into real nested blocks.
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-about-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tabs-about-list-${tabBlockCnt += 1}`;

  // the first cell of each row is the title of the tab
  const tabHeadings = [...block.children]
    .filter((child) => child.firstElementChild && child.firstElementChild.children.length > 0)
    .map((child) => child.firstElementChild);

  tabHeadings.forEach((tab, i) => {
    const id = `tabs-about-${tabBlockCnt}-tab-${i + 1}`;

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-about-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-about-tab';
    button.id = `tab-${id}`;

    button.innerHTML = tab.innerHTML;

    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });

    // add the new tab list button, to the tablist
    tablist.append(button);

    // remove the tab heading from the dom, which also removes it from the UE tree
    tab.remove();

    // remove the instrumentation from the button's heading (this removes it from the tree)
    if (button.firstElementChild) {
      moveInstrumentation(button.firstElementChild, null);
    }
  });

  block.prepend(tablist);

  // Hydrate any block-tables nested inside the panels into real EDS blocks.
  const nestedTables = [...block.querySelectorAll('.tabs-about-panel table')];
  await Promise.all(nestedTables.map((table) => hydrateNestedBlock(table)));
}
