/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroSpotlightParser from './parsers/hero-spotlight.js';
import tabsAboutParser from './parsers/tabs-about.js';
import cardsValuesParser from './parsers/cards-values.js';
import accordionHistoryParser from './parsers/accordion-history.js';
import carouselHonorsParser from './parsers/carousel-honors.js';
import cardsSegmentParser from './parsers/cards-segment.js';
import cardsProfileParser from './parsers/cards-profile.js';

// TRANSFORMER IMPORTS
import bdCleanupTransformer from './transformers/bd-cleanup.js';
import bdSectionsTransformer from './transformers/bd-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-spotlight': heroSpotlightParser,
  'tabs-about': tabsAboutParser,
  'cards-values': cardsValuesParser,
  'accordion-history': accordionHistoryParser,
  'carousel-honors': carouselHonorsParser,
  'cards-segment': cardsSegmentParser,
  'cards-profile': cardsProfileParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "about-bd-3",
  "urls": [
    "https://www.bd.com/en-us/about-bd/our-company",
    "https://www.bd.com/en-us/about-bd/quality-at-bd",
    "https://www.bd.com/en-us/about-bd/recent-mergers-and-acquisitions"
  ],
  "representativeUrl": "https://www.bd.com/en-us/about-bd/our-company",
  "description": "About BD section landing page: full-bleed spotlight hero over a tabbed content navigator (About BD / Segments / Leadership / Board of Directors) containing values cards, a history accordion, an honors carousel, alternating segment media cards and profile grids.",
  "blocks": [
    {
      "name": "hero-spotlight",
      "instances": [
        ".bd-spotlight-new"
      ]
    },
    {
      "name": "tabs-about",
      "instances": [
        ".bd-tabs"
      ]
    },
    {
      "name": "cards-values",
      "instances": [
        ".bd-value-list__container",
        ".bd-values-mission-list"
      ]
    },
    {
      "name": "accordion-history",
      "instances": [
        ".accordion.panelcontainer",
        ".bd-accordian-faq"
      ]
    },
    {
      "name": "carousel-honors",
      "instances": [
        ".bd-custom-carousel",
        ".bd-carousel-outer-container"
      ]
    },
    {
      "name": "cards-segment",
      "instances": [
        ".consolidated-image-card"
      ]
    },
    {
      "name": "cards-profile",
      "instances": [
        ".bd-content-card-list"
      ]
    }
  ],
  "urlPattern": "/en-us/about-bd/*",
  "sections": [
    {
      "id": "rc1",
      "name": "hero",
      "selector": [
        ".bd-spotlight-new",
        ".bd-spotlight__container"
      ],
      "style": null,
      "blocks": [
        "hero-spotlight"
      ],
      "defaultContent": []
    },
    {
      "id": "rc2",
      "name": "tabbed-content",
      "selector": [
        ".bd-tabs",
        ".bd-tabs.tabs.panelcontainer"
      ],
      "style": null,
      "blocks": [
        "tabs-about",
        "cards-values",
        "accordion-history",
        "carousel-honors",
        "cards-segment",
        "cards-profile"
      ],
      "defaultContent": []
    },
    {
      "id": "rc3",
      "name": "experience-fragment-chrome",
      "selector": [
        ".bd-experiencefragment",
        ".experiencefragment"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    }
  ]
};

// TRANSFORMER REGISTRY - cleanup first; section transformer runs after when 2+ sections
const transformers = [
  bdCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [bdSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup + section breaks pre-parse)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (map root URL to /index to avoid empty-path crash)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
