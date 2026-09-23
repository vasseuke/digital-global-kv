/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import formParser from "./parsers/form.js";
import columnsParser from "./parsers/columns.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/dunkincreamer-cleanup.js";
import sectionsTransformer from "./transformers/dunkincreamer-sections.js";

// PARSER REGISTRY
const parsers = {
  "form": formParser,
  "columns": columnsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "contact-form",
  "description": "Contact layout consisting of an intro text block and a form",
  "urls": [
    "https://www.dunkincreamer.com/contact-us/"
  ],
  "blocks": [
    {
      "name": "form",
      "instances": [
        "section.formcontainer-section form",
        "form#contactForm",
        "section.formcontainer-section"
      ]
    },
    {
      "name": "columns",
      "instances": [
        "section.column-grid"
      ]
    }
  ],
  "sections": [
    {
      "id": "cf1",
      "name": "formcontainer",
      "selector": [
        "section.formcontainer-section"
      ],
      "style": null,
      "blocks": [
        "form"
      ],
      "defaultContent": []
    },
    {
      "id": "cf2",
      "name": "column-grid-1",
      "selector": [
        "section.column-grid:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [
        "columns"
      ],
      "defaultContent": []
    },
    {
      "id": "cf3",
      "name": "column-grid-2",
      "selector": [
        "section.column-grid:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "columns"
      ],
      "defaultContent": []
    },
    {
      "id": "cf4",
      "name": "column-grid-3",
      "selector": [
        "section.column-grid:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [
        "columns"
      ],
      "defaultContent": []
    },
    {
      "id": "cf5",
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

// TRANSFORMER REGISTRY - cleanup first, sections after
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

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

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const claimed = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
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

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    executeTransformers("beforeTransform", main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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

    executeTransformers("afterTransform", main, payload);

    const hr = document.createElement("hr");
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, "")
      .replace(/\.html?$/, "");
    const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
