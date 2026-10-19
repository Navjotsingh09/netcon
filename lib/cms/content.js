import sanitizeHtml from 'sanitize-html';
import { DomUtils, parseDocument } from 'htmlparser2';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ARTICLE_HTML_LENGTH = 150000;
const ARTICLE_BLOCK_TAGS = new Set(['blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'li', 'ol', 'p', 'ul']);

function normalizeArticleParagraphs(nodes) {
  let html = '';
  let inlineHtml = '';
  function flushParagraph() {
    if (inlineHtml.trim()) html += `<p>${inlineHtml.trim()}</p>`;
    inlineHtml = '';
  }
  for (const node of nodes) {
    if (node.name === 'div') {
      flushParagraph();
      html += normalizeArticleParagraphs(node.children);
    } else if (ARTICLE_BLOCK_TAGS.has(node.name)) {
      flushParagraph();
      html += serializeArticleNode(node);
    } else {
      inlineHtml += DomUtils.getOuterHTML(node);
    }
  }
  flushParagraph();
  return html;
}

function serializeArticleNode(node) {
  if (node.name === 'div') return normalizeArticleParagraphs(node.children);
  if (['blockquote', 'li', 'ol', 'ul'].includes(node.name)) {
    return `<${node.name}>${node.children.map(serializeArticleNode).join('')}</${node.name}>`;
  }
  return DomUtils.getOuterHTML(node);
}

function stringField(value, field, maximum, errors, required = true) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (required && !normalized) errors[field] = 'This field is required.';
  if (normalized.length > maximum) errors[field] = `Use at most ${maximum} characters.`;
  return normalized;
}

export function sanitizeArticleHtml(value) {
  // Keep editor block boundaries until their inline content has been wrapped.
  const sanitized = sanitizeHtml(String(value || ''), {
    allowedTags: [
      'a', 'blockquote', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'li', 'ol', 'p', 'strong', 'ul'
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'class'],
      img: ['src', 'alt', 'width', 'height']
    },
    allowedClasses: { a: ['article-cta'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true)
    }
  }).trim();
  return normalizeArticleParagraphs(parseDocument(sanitized).children);
}

export function cleanMalformedEmptyLinks(value) {
  return String(value || '').replace(/\[\]\(https?:\/\/[^)\r\n]+\)(?=\s*<a\b)/gi, '');
}

export function validateRevisionInput(input, { allowSlug = false } = {}) {
  const errors = {};
  let schemaMarkup = null;
  const revision = {
    title: stringField(input.title, 'title', 180, errors),
    excerpt: stringField(input.excerpt, 'excerpt', 360, errors),
    category: stringField(input.category, 'category', 80, errors),
    featuredImageUrl: stringField(input.featuredImageUrl, 'featuredImageUrl', 2048, errors, false),
    featuredImageAlt: stringField(input.featuredImageAlt, 'featuredImageAlt', 250, errors, false),
    seoTitle: stringField(input.seoTitle || input.title, 'seoTitle', 180, errors),
    seoDescription: stringField(input.seoDescription || input.excerpt, 'seoDescription', 360, errors)
  };
  const rawArticleHtml = typeof input.articleHtml === 'string' ? input.articleHtml : '';
  if (!rawArticleHtml.trim()) errors.articleHtml = 'Article content is required.';
  if (rawArticleHtml.length > MAX_ARTICLE_HTML_LENGTH) {
    errors.articleHtml = `Use at most ${MAX_ARTICLE_HTML_LENGTH} characters.`;
  }
  revision.articleHtml = sanitizeArticleHtml(cleanMalformedEmptyLinks(rawArticleHtml));
  if (!revision.articleHtml) errors.articleHtml = 'Article content must contain allowed HTML.';

  if (typeof input.schemaMarkup === 'string' && input.schemaMarkup.trim()) {
    try {
      schemaMarkup = JSON.parse(input.schemaMarkup);
      if (!schemaMarkup || typeof schemaMarkup !== 'object' || Array.isArray(schemaMarkup)) {
        errors.schemaMarkup = 'Schema markup must be a JSON object.';
      }
    } catch {
      errors.schemaMarkup = 'Schema markup must be valid JSON.';
    }
  }
  revision.schemaMarkup = schemaMarkup;

  if (allowSlug) {
    revision.publicSlug = stringField(input.publicSlug, 'publicSlug', 120, errors).toLowerCase();
    if (revision.publicSlug && !SLUG_PATTERN.test(revision.publicSlug)) {
      errors.publicSlug = 'Use lowercase letters, numbers, and single hyphens only.';
    }
  }

  for (const urlField of ['featuredImageUrl']) {
    if (revision[urlField] && !/^https:\/\/|^\//.test(revision[urlField])) {
      errors[urlField] = 'Use an HTTPS or site-relative image URL.';
    }
  }
  return { errors, revision };
}