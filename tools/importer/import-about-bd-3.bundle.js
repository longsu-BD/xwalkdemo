/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-about-bd-3.js
  var import_about_bd_3_exports = {};
  __export(import_about_bd_3_exports, {
    default: () => import_about_bd_3_default
  });

  // tools/importer/parsers/hero-spotlight.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector('.bd-spotlight__image-box img, img[class*="image"], img');
    const heading = element.querySelector(".bd-spotlight-heading-html h1, .bd-spotlight-heading-html h2, h1, h2");
    const description = element.querySelector('.bd-spotlight__container-left__description-left p, [class*="description"] p');
    const ctaLinks = Array.from(element.querySelectorAll('.bd-spotlight__container-left a, [class*="container-left"] a'));
    if (!image && !heading && !description && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      const imgFrag = document2.createDocumentFragment();
      imgFrag.appendChild(document2.createComment(" field:image "));
      imgFrag.appendChild(image);
      cells.push([imgFrag]);
    }
    const textFrag = document2.createDocumentFragment();
    textFrag.appendChild(document2.createComment(" field:text "));
    let hasText = false;
    if (heading) {
      textFrag.appendChild(heading);
      hasText = true;
    }
    if (description) {
      textFrag.appendChild(description);
      hasText = true;
    }
    ctaLinks.forEach((a) => {
      textFrag.appendChild(a);
      hasText = true;
    });
    if (hasText) {
      cells.push([textFrag]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-spotlight", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-about.js
  function parse2(element, { document: document2 }) {
    const tabItems = Array.from(element.querySelectorAll(".cmp-tabs__tab, li.cmp-tabs__tabitem"));
    const panels = Array.from(element.querySelectorAll(".cmp-tabs__tabpanel"));
    if (tabItems.length === 0 || panels.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    tabItems.forEach((tab, i) => {
      const tabId = tab.getAttribute("id");
      let panel = null;
      if (tabId) {
        panel = panels.find((p) => p.getAttribute("id") === tabId) || null;
      }
      if (!panel) panel = panels[i] || null;
      const titleCell = document2.createDocumentFragment();
      titleCell.appendChild(document2.createComment(" field:title "));
      const label = document2.createElement("p");
      label.textContent = (tab.textContent || "").trim();
      titleCell.appendChild(label);
      const contentCell = document2.createDocumentFragment();
      contentCell.appendChild(document2.createComment(" field:content_richtext "));
      if (panel) {
        const wrapper = document2.createElement("blockquote");
        Array.from(panel.childNodes).forEach((node) => wrapper.appendChild(node));
        contentCell.appendChild(wrapper);
      }
      cells.push([titleCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-about", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-values.js
  function parse3(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(".bd-value-list__card-container"));
    if (cards.length === 0) {
      cards = Array.from(element.querySelectorAll(".bd-value-list__content"));
    }
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const icon = card.querySelector("img.bd-value-list__icon, img");
      const description = card.querySelector('.bd-value-list__description, [class*="description"]');
      const imageCell = document2.createDocumentFragment();
      if (icon) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(icon);
      }
      const textCell = document2.createDocumentFragment();
      if (description) {
        textCell.appendChild(document2.createComment(" field:text "));
        textCell.appendChild(description);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-values", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-history.js
  function parse4(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".cmp-accordion__item"));
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const title = item.querySelector(".cmp-accordion__title, .cmp-accordion__button");
      const panel = item.querySelector(".cmp-accordion__panel");
      const summaryCell = document2.createDocumentFragment();
      summaryCell.appendChild(document2.createComment(" field:summary "));
      const summaryEl = document2.createElement("p");
      summaryEl.textContent = title ? (title.textContent || "").trim() : "";
      summaryCell.appendChild(summaryEl);
      const textCell = document2.createDocumentFragment();
      textCell.appendChild(document2.createComment(" field:text "));
      if (panel) {
        Array.from(panel.childNodes).forEach((node) => textCell.appendChild(node));
      }
      cells.push([summaryCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-history", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-honors.js
  function parse5(element, { document: document2 }) {
    let slides = Array.from(element.querySelectorAll(".cmp-carousel__item:not(.slick-cloned)"));
    if (slides.length === 0) {
      slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    }
    if (slides.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    slides.forEach((slide) => {
      const key = (slide.textContent || "").replace(/\s+/g, " ").trim();
      if (!key || seen.has(key)) return;
      seen.add(key);
      const image = slide.querySelector(".bd-content-card__image img");
      const details = slide.querySelector(".bd-content-card__card-details, .bd-content-card__wrapper, .bd-content-card");
      const imageCell = document2.createDocumentFragment();
      if (image) {
        imageCell.appendChild(document2.createComment(" field:media_image "));
        imageCell.appendChild(image);
      }
      const textCell = document2.createDocumentFragment();
      if (details) {
        textCell.appendChild(document2.createComment(" field:content_text "));
        Array.from(details.childNodes).forEach((node) => textCell.appendChild(node.cloneNode(true)));
        const scratch = document2.createElement("div");
        Array.from(textCell.childNodes).forEach((n) => scratch.appendChild(n));
        scratch.querySelectorAll('.bd-content-card__learn-more-arrow, [style*="background-image"], img, picture').forEach((el) => {
          el.remove();
        });
        scratch.querySelectorAll("a").forEach((a) => {
          if (!a.textContent.trim() && !a.querySelector("img, picture")) a.remove();
        });
        scratch.querySelectorAll("p").forEach((p) => {
          if (!p.textContent.trim() && !p.querySelector("a, img, picture")) p.remove();
        });
        Array.from(scratch.childNodes).forEach((n) => textCell.appendChild(n));
      }
      cells.push([imageCell, textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-honors", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-segment.js
  function parse6(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(".bd-image-card__wrapper"));
    if (cards.length === 0) cards = [element];
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".bd-image-card__image, .image-withoutstyle img, img");
      const heading = card.querySelector(".bd-image-card__heading");
      const details = card.querySelector(".bd-image-card__details");
      const content = card.querySelector(".bd-image-card__content");
      const imageCell = document2.createDocumentFragment();
      if (image) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(image);
      }
      const textCell = document2.createDocumentFragment();
      let hasText = false;
      if (heading || details) {
        textCell.appendChild(document2.createComment(" field:text "));
        if (heading) {
          textCell.appendChild(heading);
          hasText = true;
        }
        if (details) {
          textCell.appendChild(details);
          hasText = true;
        }
      } else if (content) {
        textCell.appendChild(document2.createComment(" field:text "));
        Array.from(content.childNodes).forEach((node) => textCell.appendChild(node));
        hasText = true;
      }
      if (image || hasText) {
        cells.push([imageCell, textCell]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-segment", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-profile.js
  function parse7(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll("li.bd-content-card-list__card, .bd-content-card-list__card"));
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".bd-content-card-list__img img, img");
      const heading = card.querySelector(".bd-content-card-list__heading");
      const description = card.querySelector(".bd-content-card-list__description");
      const imageCell = document2.createDocumentFragment();
      if (image) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(image);
      }
      const textCell = document2.createDocumentFragment();
      let hasText = false;
      if (heading || description) {
        textCell.appendChild(document2.createComment(" field:text "));
        if (heading) {
          textCell.appendChild(heading);
          hasText = true;
        }
        if (description) {
          textCell.appendChild(description);
          hasText = true;
        }
      }
      if (image || hasText) {
        cells.push([imageCell, textCell]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-profile", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/bd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".uwy",
        // UserWay accessibility widget (cleaned.html line 2)
        "#onetrust-consent-sdk",
        // OneTrust cookie consent SDK (cleaned.html line 3792)
        "iframe",
        // GPP Locator iframe + UserWay iframe (cleaned.html lines 26, 3790)
        "#bd-form-data-collection",
        // Adobe form data collection placeholder (cleaned.html line 3788)
        "#popup_video_modal"
        // hidden video modal placeholder (cleaned.html line 50)
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".bd-experiencefragment",
        // header + footer experience-fragment chrome
        "header.bd-header",
        // site header (cleaned.html line 52)
        "footer.bd-footer",
        // site footer (cleaned.html line 3595)
        "nav#navigation",
        // main navigation (cleaned.html line 54)
        "link",
        // stray <link> tags (cleaned.html line 3770)
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/bd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-about-bd-3.js
  var parsers = {
    "hero-spotlight": parse,
    "tabs-about": parse2,
    "cards-values": parse3,
    "accordion-history": parse4,
    "carousel-honors": parse5,
    "cards-segment": parse6,
    "cards-profile": parse7
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_about_bd_3_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_about_bd_3_exports);
})();
