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

  // tools/importer/import-archive-listing.js
  var import_archive_listing_exports = {};
  __export(import_archive_listing_exports, {
    default: () => import_archive_listing_default
  });

  // tools/importer/parsers/hero-orange-cta.js
  function parse(element, { document: document2 }) {
    const cells = [];
    const bg = element.querySelector('picture, img[class*="bg"], img');
    const bgNode = bg && bg.tagName === "IMG" && bg.closest("picture") ? bg.closest("picture") : bg;
    if (bgNode) cells.push([bgNode]);
    const contentCell = [];
    const titleEl = element.querySelector('.zipcodetitle, h1, h2, [class*="title"]');
    if (titleEl) {
      const text = titleEl.textContent.trim();
      if (titleEl.tagName === "DIV" || titleEl.tagName === "SPAN") {
        const h = document2.createElement("h2");
        h.textContent = text;
        contentCell.push(h);
      } else {
        contentCell.push(titleEl);
      }
    }
    const cta = element.querySelector(".btn-wrapper a, a.button");
    if (cta) contentCell.push(cta);
    const subtitle = element.querySelector(".zipcodesubtitle");
    if (subtitle) {
      contentCell.push(subtitle);
    } else {
      Array.from(element.querySelectorAll("a")).forEach((a) => {
        if (a !== cta) contentCell.push(a);
      });
    }
    if (!contentCell.length && !bgNode) {
      element.replaceWith(...element.childNodes);
      return;
    }
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-orange-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/dunkincreamer-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#tc-privacy-wrapper",
        // cookie/privacy banner (cleaned.html line 709)
        ".popup-wrapper",
        // promo modal overlay #popup (line 567)
        "#ae_enabled_site",
        // AudioEye blurb (line 3)
        ".audioeye-skip-link"
        // AudioEye skip link (line 2)
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header#header",
        // main site header/nav (line 11)
        "#mobile-menu",
        // slide-out mobile menu (line 89)
        "footer.page-footer",
        // site footer (line 605)
        "#ae_app",
        // AudioEye app container (line 725)
        "#ae_launcher",
        // AudioEye launcher aside (line 749)
        "#batBeacon984915460148",
        // Bing tracking beacon (line 722)
        "iframe",
        // doubleclick activity iframe (line 707)
        "link",
        // stray stylesheet link (line 702)
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/dunkincreamer-sections.js
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

  // tools/importer/import-archive-listing.js
  var parsers = {
    "hero-orange-cta": parse
  };
  var PAGE_TEMPLATE = {
    "name": "archive-listing",
    "description": "Archive/listing layout with a hero header and a stacked list of text entries",
    "urls": [
      "https://www.dunkincreamer.com/author/danoneitccadmin/",
      "https://www.dunkincreamer.com/category/uncategorized/"
    ],
    "blocks": [
      {
        "name": "hero-orange-cta",
        "instances": [
          "section.zipcodefinder"
        ]
      }
    ],
    "sections": [
      {
        "id": "al1",
        "name": "zipcodefinder-hero",
        "selector": [
          "section.zipcodefinder"
        ],
        "style": "orange",
        "blocks": [
          "hero-orange-cta"
        ],
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
    const claimed = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          const overlaps = claimed.some((c) => c === element || c.contains(element) || element.contains(c));
          if (overlaps) return;
          claimed.push(element);
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_archive_listing_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
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
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_archive_listing_exports);
})();
