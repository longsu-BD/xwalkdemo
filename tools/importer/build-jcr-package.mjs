/* eslint-disable no-console */
/**
 * Build a JCR content-package ZIP from the imported .plain.html pages for
 * ingestion into the AEM author instance (xwalk).
 *
 * Pipeline per page: .plain.html -> (wrap in <main>) -> html2md -> md2jcr
 * (with the project's component models/definition/filters) -> createPage,
 * then createJcrPackage() zips them. /media-da/ image refs are rewritten to
 * the AEM DAM path so md2jcr emits DAM asset references.
 *
 * Modules resolve from the bundled excat marketplace node_modules trees.
 */
import fs from 'node:fs';
import path from 'node:path';

const MCP = '/home/node/.excat-marketplaces/excat-marketplace/excat/tools/excatops-mcp/node_modules';
const MD2JCR = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules';
const { html2md } = await import(`${MCP}/@adobe/helix-html2md/src/index.js`);
const { md2jcr } = await import(`${MD2JCR}/@adobe/helix-md2jcr/src/index.js`);
const { createJcrPackage, createPage } = await import(`${MCP}/@adobe/helix-importer-jcr-packaging/src/index.js`);

const ROOT = '/backups/longsu-BD/xwalkdemo/repo';
const SITE_CONTENT_PATH = '/content/xwalkdemo';
const ASSET_DAM_PATH = '/content/dam/xwalkdemo';
const OUT_DIR = path.join(ROOT, 'tools/importer/jcr-out');

const models = JSON.parse(fs.readFileSync(path.join(ROOT, 'component-models.json'), 'utf8'));
const definition = JSON.parse(fs.readFileSync(path.join(ROOT, 'component-definition.json'), 'utf8'));
const filters = JSON.parse(fs.readFileSync(path.join(ROOT, 'component-filters.json'), 'utf8'));

const PAGES = [
  { docPath: '/en-us/about-bd/our-company', url: 'https://www.bd.com/en-us/about-bd/our-company' },
  { docPath: '/en-us/about-bd/quality-at-bd', url: 'https://www.bd.com/en-us/about-bd/quality-at-bd' },
  { docPath: '/en-us/about-bd/recent-mergers-and-acquisitions', url: 'https://www.bd.com/en-us/about-bd/recent-mergers-and-acquisitions' },
];

const log = {
  info: () => {}, debug: () => {}, warn: (...a) => console.error('[warn]', ...a), error: (...a) => console.error('[error]', ...a),
};

const rewriteMedia = (html) => html.replace(/\/media-da\/([a-f0-9]+)\.(\w+)/g, `${ASSET_DAM_PATH}/$1.$2`);

const assetUrls = new Set();

// Build each page's JCR sequentially (reduce over promises — avoids for/continue).
const pages = await PAGES.reduce(async (accP, p) => {
  const acc = await accP;
  const plainPath = path.join(ROOT, 'content', `${p.docPath}.plain.html`);
  if (!fs.existsSync(plainPath)) {
    console.error(`missing ${plainPath}`);
    return acc;
  }
  const inner = rewriteMedia(fs.readFileSync(plainPath, 'utf8'));
  // collect DAM asset paths referenced (for the package's asset node stubs)
  [...inner.matchAll(new RegExp(`${ASSET_DAM_PATH}/[a-f0-9]+\\.\\w+`, 'g'))].forEach((m) => assetUrls.add(m[0]));
  const html = `<!DOCTYPE html><html><body><header></header><main>${inner}</main><footer></footer></body></html>`;
  const md = await html2md(html, { log, url: p.url });
  const jcr = await md2jcr(md, { models, definition, filters });
  console.error(`✅ ${p.docPath} (md ${md.length}b, jcr ${jcr.length}b)`);
  return [...acc, createPage(p.docPath, jcr, p.url)];
}, Promise.resolve([]));

fs.mkdirSync(OUT_DIR, { recursive: true });
await createJcrPackage(OUT_DIR, pages, [...assetUrls], SITE_CONTENT_PATH, ASSET_DAM_PATH, 'bd-about-bd-3');
console.error(`\n📦 package output dir: ${OUT_DIR}`);
fs.readdirSync(OUT_DIR).forEach((f) => {
  const st = fs.statSync(path.join(OUT_DIR, f));
  console.error(`   ${f} (${st.size} bytes)`);
});
