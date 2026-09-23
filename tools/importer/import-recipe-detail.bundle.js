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

  // tools/importer/import-recipe-detail.js
  var import_recipe_detail_exports = {};
  __export(import_recipe_detail_exports, {
    default: () => import_recipe_detail_default
  });

  // tools/importer/parsers/hero-minimal-dark.js
  function parse(element, { document: document2 }) {
    const unlazy = (img) => {
      if (!img) return img;
      const cur = img.getAttribute("src") || "";
      if (!cur || /^data:/.test(cur)) {
        const real = img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || img.getAttribute("data-original");
        if (real) img.setAttribute("src", real);
      }
      return img;
    };
    const cells = [];
    const photo = unlazy(element.querySelector("figure.recipeimage img, .recipeimage img, figure img"));
    if (photo) cells.push([photo]);
    const caption = element.querySelector("figcaption.text_container, figcaption, .text_container");
    const scope = caption || element;
    const contentCell = [];
    const icon = scope.querySelector(".recipe-icon");
    if (icon) contentCell.push(icon);
    const title = scope.querySelector(".recipe-title, h1, h2");
    if (title && title.textContent.trim()) {
      if (/^(DIV|SPAN)$/.test(title.tagName)) {
        const h = document2.createElement("h1");
        h.textContent = title.textContent.trim();
        contentCell.push(h);
      } else {
        contentCell.push(title);
      }
    }
    const meta = scope.querySelector(".recipe-minute_serves");
    if (meta && meta.textContent.trim()) {
      const p = document2.createElement("p");
      const parts = Array.from(meta.querySelectorAll("span")).map((s) => s.textContent.trim()).filter(Boolean);
      p.textContent = parts.length ? parts.join(" \xB7 ") : meta.textContent.trim();
      contentCell.push(p);
    }
    const desc = scope.querySelector(".recipe-description");
    if (desc && desc.textContent.trim()) {
      const p = document2.createElement("p");
      p.innerHTML = desc.innerHTML;
      contentCell.push(p);
    }
    if (!photo && !contentCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    if (contentCell.length) cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-minimal-dark", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-recipe.js
  function parse2(element, { document: document2 }) {
    const meaningful = (root) => Array.from(root.childNodes).filter((n) => {
      if (n.nodeType === 1) return true;
      if (n.nodeType === 3) return n.textContent.trim().length > 0;
      return false;
    });
    const unlazy = (img) => {
      if (!img) return img;
      const cur = img.getAttribute("src") || "";
      if (!cur || /^data:/.test(cur)) {
        const real = img.getAttribute("data-src") || img.getAttribute("data-lazy-src") || img.getAttribute("data-original");
        if (real) img.setAttribute("src", real);
      }
      return img;
    };
    const cells = [];
    const featured = element.querySelector(".featured-grid");
    if (featured) {
      const img = unlazy(featured.querySelector("figure img, .relative img, img"));
      const caption = featured.querySelector("figcaption");
      const cardCell = [];
      if (caption) {
        const parts = caption.querySelectorAll(
          ".recipe-icon, .recipe-title, .recipe-minute_serves, .recipe-description, .recipe-button a, .recipe-button, a.button"
        );
        const seen = /* @__PURE__ */ new Set();
        parts.forEach((p) => {
          if (p.matches(".recipe-button") && p.querySelector("a")) return;
          if (!seen.has(p)) {
            seen.add(p);
            cardCell.push(p);
          }
        });
        if (!cardCell.length) meaningful(caption).forEach((n) => cardCell.push(n));
      }
      if (img || cardCell.length) {
        cells.push([img || "", cardCell.length ? cardCell : ""]);
      }
    } else {
      let columns = Array.from(element.querySelectorAll(":scope .row .column"));
      if (!columns.length) columns = Array.from(element.querySelectorAll(".column"));
      if (columns.length) {
        const row = columns.map((col) => {
          col.querySelectorAll("img").forEach(unlazy);
          const nodes = meaningful(col);
          return nodes.length ? nodes : [col];
        });
        cells.push(row);
      }
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-recipe", cells });
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

  // tools/importer/import-recipe-detail.js
  var parsers = {
    "hero-minimal-dark": parse,
    "columns-recipe": parse2
  };
  var PAGE_TEMPLATE = {
    "name": "recipe-detail",
    "description": "Detail layout with hero, card sections, and image-and-text content blocks",
    "urls": [
      "https://www.dunkincreamer.com/learn-more/coffee-creamer-recipes/coconut-cream-pie-blender/",
      "https://www.dunkincreamer.com/learn-more/coffee-creamer-recipes/easy-tres-leches-cake/",
      "https://www.dunkincreamer.com/learn-more/coffee-creamer-recipes/latte-maximus/",
      "https://www.dunkincreamer.com/where-to-buy-dunkin-creamer/"
    ],
    "blocks": [
      {
        "name": "hero-minimal-dark",
        "instances": [
          "section.recipeteaser-section"
        ]
      },
      {
        "name": "columns-recipe",
        "instances": [
          "section.productused-section .row",
          "section.productused-section"
        ]
      }
    ],
    "sections": [
      {
        "id": "rd1",
        "name": "recipeteaser",
        "selector": [
          "section.recipeteaser-section"
        ],
        "style": null,
        "blocks": [
          "hero-minimal-dark"
        ],
        "defaultContent": []
      },
      {
        "id": "rd2",
        "name": "productused",
        "selector": [
          "section.productused-section"
        ],
        "style": null,
        "blocks": [
          "columns-recipe"
        ],
        "defaultContent": []
      },
      {
        "id": "rd3",
        "name": "zipcodefinder",
        "selector": [
          "section.zipcodefinder"
        ],
        "style": "orange",
        "blocks": [],
        "defaultContent": [
          "section.zipcodefinder h1",
          "section.zipcodefinder a"
        ]
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
  var import_recipe_detail_default = {
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
  return __toCommonJS(import_recipe_detail_exports);
})();
