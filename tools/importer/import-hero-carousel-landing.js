/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroLightWithimgParser from './parsers/hero-light-withimg.js';
import carouselRecipeParser from './parsers/carousel-recipe.js';
import columnsPromoParser from './parsers/columns-promo.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/dunkincreamer-cleanup.js';
import sectionsTransformer from './transformers/dunkincreamer-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-light-withimg': heroLightWithimgParser,
  'carousel-recipe': carouselRecipeParser,
  'columns-promo': columnsPromoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'hero-carousel-landing',
  description: 'Landing/product layout: full-width hero banner followed by a carousel and alternating image-and-text feature sections',
  urls: [
    'https://www.dunkincreamer.com/',
    'https://www.dunkincreamer.com/coffee-creamer/extra-extra-creamer/',
    'https://www.dunkincreamer.com/coffee-creamer/pumpkin-munchkin/',
    'https://www.dunkincreamer.com/cold-foam-creamer/extra-extra-cold-foam-creamer/',
    'https://www.dunkincreamer.com/learn-more/about-dunkins/',
  ],
  blocks: [
    {
      name: 'hero-light-withimg',
      instances: ['section.home_header .hero_banner', 'section.home_header'],
    },
    {
      name: 'carousel-recipe',
      instances: ['section.carousel-section .tns-outer', 'section.carousel-section .row'],
    },
    {
      name: 'columns-promo',
      instances: ['section.column-grid'],
    },
  ],
  sections: [
    {
      id: 'rc1', name: 'hero', selector: ['section.home_header.rel', 'section.home_header'], style: null, blocks: ['hero-light-withimg'], defaultContent: [],
    },
    {
      id: 'rc2', name: 'carousel', selector: ['section.carousel-section.addpadding', 'section.carousel-section'], style: 'pink', blocks: ['carousel-recipe'], defaultContent: [],
    },
    {
      id: 'rc3', name: 'column-grid', selector: ['section.column-grid'], style: 'grey', blocks: ['columns-promo'], defaultContent: [],
    },
    {
      id: 'rc4', name: 'zipcodefinder', selector: ['section.zipcodefinder'], style: null, blocks: [], defaultContent: ['section.zipcodefinder h1', 'section.zipcodefinder h2', 'section.zipcodefinder a'],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, sections after (afterTransform emits <hr>/metadata)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
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
 * Find all block instances on the page based on the embedded template.
 * De-duplicates when multiple selectors resolve to the same (or nested) element.
 */
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
        // Skip if this element, an ancestor, or a descendant was already claimed
        // by an earlier (more specific) selector for the same block.
        const overlaps = claimed.some((c) => c === element || c.contains(element) || element.contains(c));
        if (overlaps) return;
        claimed.push(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
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

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already detached by an earlier parser
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

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path; map root URL to /index (empty path crashes the bundled importer)
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
