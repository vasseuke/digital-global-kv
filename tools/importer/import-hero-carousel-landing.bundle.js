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

  // tools/importer/import-hero-carousel-landing.js
  var import_hero_carousel_landing_exports = {};
  __export(import_hero_carousel_landing_exports, {
    default: () => import_hero_carousel_landing_default
  });

  // tools/importer/parsers/hero-light-withimg.js
  function parse(element, { document: document2 }) {
    const heading = element.querySelector('.hero_text h1, .hero_text h2, h1, h2, [class*="title"]');
    const subheading = element.querySelector(".hero_text h3, .hero_text h4, .hero_text p, h3");
    const ctaLinks = Array.from(element.querySelectorAll(".hero_text a, .hero_banner a"));
    const imageWraps = Array.from(element.querySelectorAll(".hero_img picture, .hero_img img"));
    const images = [];
    imageWraps.forEach((node) => {
      if (node.tagName === "IMG" && node.closest("picture")) return;
      images.push(node);
    });
    if (!heading && !subheading && images.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (images.length) {
      cells.push([images]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (subheading) contentCell.push(subheading);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-light-withimg", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-recipe.js
  function parse2(element, { document: document2 }) {
    const normalize = (href) => (href || "").replace(/\/+$/, "");
    const bgUrl = (el) => {
      if (!el) return null;
      const bg = el.style && el.style.backgroundImage;
      const src = bg || el.getAttribute && el.getAttribute("style") || "";
      const m = src.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      return m ? m[1] : null;
    };
    const links = Array.from(element.querySelectorAll("a[href]"));
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    links.forEach((link) => {
      const key = normalize(link.getAttribute("href"));
      if (!key || seen.has(key)) return;
      let imgEl = link.querySelector('figure img, .relative img, img:not([src^="data:"])');
      if (!imgEl) {
        const url = bgUrl(link.querySelector("figure")) || bgUrl(link.querySelector(".relative"));
        if (url) {
          imgEl = document2.createElement("img");
          imgEl.setAttribute("src", url);
          const t = link.querySelector(".recipe-title");
          if (t && t.textContent.trim()) imgEl.setAttribute("alt", t.textContent.trim());
        }
      }
      if (!imgEl) return;
      seen.add(key);
      const contentCell = [];
      const titleEl = link.querySelector(".recipe-title");
      if (titleEl && titleEl.textContent.trim()) {
        const heading = document2.createElement("h3");
        heading.textContent = titleEl.textContent.trim();
        contentCell.push(heading);
      }
      const metaEl = link.querySelector(".recipe-minute_serves");
      if (metaEl) {
        let parts = Array.from(metaEl.querySelectorAll("span")).map((s) => s.textContent.trim()).filter(Boolean);
        if (!parts.length) {
          let raw = (metaEl.textContent || "").replace(/\s+/g, " ").trim();
          raw = raw.replace(/\s*(Serves|Makes)\b/i, " \u2022 $1");
          if (raw) parts = [raw];
        }
        if (parts.length) {
          const meta = document2.createElement("p");
          meta.textContent = parts.join(" \u2022 ");
          contentCell.push(meta);
        }
      }
      const cta = document2.createElement("a");
      cta.setAttribute("href", link.getAttribute("href"));
      cta.textContent = "View Recipe";
      contentCell.push(cta);
      cells.push([imgEl, contentCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-recipe", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-promo.js
  function parse3(element, { document: document2 }) {
    const pickMedia = (scope) => {
      if (!scope) return null;
      const pic = scope.querySelector("picture");
      if (pic) return pic;
      const img = scope.querySelector("img");
      return img || null;
    };
    const buildPanelRow = (panel) => {
      const imgScope = panel.querySelector(".home_img") || panel;
      const media = pickMedia(imgScope);
      const contentCell = [];
      const qr = pickMedia(panel.querySelector(".dannon_qr"));
      if (qr) contentCell.push(qr);
      const earning = panel.querySelector(".dunkin_earning");
      if (earning) {
        Array.from(earning.querySelectorAll("a")).forEach((a) => contentCell.push(a));
        Array.from(earning.querySelectorAll("p, h2, h3, h4")).forEach((n) => contentCell.push(n));
      } else {
        Array.from(panel.querySelectorAll("a")).forEach((a) => {
          if (!media || !media.contains(a)) contentCell.push(a);
        });
        Array.from(panel.querySelectorAll("p, h2, h3, h4")).forEach((n) => contentCell.push(n));
      }
      return [media || "", contentCell.length ? contentCell : ""];
    };
    const panels = Array.from(element.children).filter((c) => c.nodeType === 1);
    const cells = [];
    panels.forEach((panel) => {
      const row = buildPanelRow(panel);
      if (row[0] || Array.isArray(row[1]) && row[1].length) cells.push(row);
    });
    if (cells.length === 0) {
      const row = buildPanelRow(element);
      if (row[0] || Array.isArray(row[1]) && row[1].length) cells.push(row);
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-promo", cells });
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

  // tools/importer/import-hero-carousel-landing.js
  var parsers = {
    "hero-light-withimg": parse,
    "carousel-recipe": parse2,
    "columns-promo": parse3
  };
  var PAGE_TEMPLATE = {
    name: "hero-carousel-landing",
    description: "Landing/product layout: full-width hero banner followed by a carousel and alternating image-and-text feature sections",
    urls: [
      "https://www.dunkincreamer.com/",
      "https://www.dunkincreamer.com/coffee-creamer/extra-extra-creamer/",
      "https://www.dunkincreamer.com/coffee-creamer/pumpkin-munchkin/",
      "https://www.dunkincreamer.com/cold-foam-creamer/extra-extra-cold-foam-creamer/",
      "https://www.dunkincreamer.com/learn-more/about-dunkins/"
    ],
    blocks: [
      {
        name: "hero-light-withimg",
        instances: ["section.home_header .hero_banner", "section.home_header"]
      },
      {
        name: "carousel-recipe",
        instances: ["section.carousel-section .tns-outer", "section.carousel-section .row"]
      },
      {
        name: "columns-promo",
        instances: ["section.column-grid"]
      }
    ],
    sections: [
      {
        id: "rc1",
        name: "hero",
        selector: ["section.home_header.rel", "section.home_header"],
        style: null,
        blocks: ["hero-light-withimg"],
        defaultContent: []
      },
      {
        id: "rc2",
        name: "carousel",
        selector: ["section.carousel-section.addpadding", "section.carousel-section"],
        style: "pink",
        blocks: ["carousel-recipe"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "column-grid",
        selector: ["section.column-grid"],
        style: "grey",
        blocks: ["columns-promo"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "zipcodefinder",
        selector: ["section.zipcodefinder"],
        style: null,
        blocks: [],
        defaultContent: ["section.zipcodefinder h1", "section.zipcodefinder h2", "section.zipcodefinder a"]
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
  var import_hero_carousel_landing_default = {
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
  return __toCommonJS(import_hero_carousel_landing_exports);
})();
