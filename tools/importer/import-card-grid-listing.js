/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsRecipeParser from "./parsers/columns-recipe.js";
import cardsRecipeParser from "./parsers/cards-recipe.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/dunkincreamer-cleanup.js";
import sectionsTransformer from "./transformers/dunkincreamer-sections.js";

// PARSER REGISTRY
const parsers = {
  "columns-recipe": columnsRecipeParser,
  "cards-recipe": cardsRecipeParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "card-grid-listing",
  "description": "Listing layout with hero and a grid of cards over background sections",
  "urls": [
    "https://www.dunkincreamer.com/learn-more/coffee-creamer-recipes/",
    "https://www.dunkincreamer.com/learn-more/coffee-creamer-recipes/ball-game-blender/",
    "https://www.dunkincreamer.com/learn-more/coffee-creamer-recipes/blueberry-muffins/",
    "https://www.dunkincreamer.com/learn-more/coffee-creamer-recipes/english-toffee-coffee/"
  ],
  "blocks": [
    {
      "name": "columns-recipe",
      "instances": [
        "section.recipefeatured-section .row",
        "section.recipefeatured-section"
      ]
    },
    {
      "name": "cards-recipe",
      "instances": [
        "section.recipegrid-section .row",
        "section.recipegrid-section"
      ]
    }
  ],
  "sections": [
    {
      "id": "cg1",
      "name": "recipefeatured",
      "selector": [
        "section.recipefeatured-section"
      ],
      "style": null,
      "blocks": [
        "columns-recipe"
      ],
      "defaultContent": [
        "section.recipefeatured-section h1",
        "section.recipefeatured-section h2"
      ]
    },
    {
      "id": "cg2",
      "name": "socialmedia",
      "selector": [
        "div.socialmedia"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "div.socialmedia"
      ]
    },
    {
      "id": "cg3",
      "name": "recipegrid",
      "selector": [
        "section.recipegrid-section"
      ],
      "style": null,
      "blocks": [
        "cards-recipe"
      ],
      "defaultContent": []
    },
    {
      "id": "cg4",
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
