import sanitizeHtml from 'sanitize-html';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ARTICLE_HTML_LENGTH = 150000;

function stringField(value, field, maximum, errors, required = true) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (required && !normalized) errors[field] = 'This field is required.';
  if (normalized.length > maximum) errors[field] = `Use at most ${maximum} characters.`;
  return normalized;
}

export function sanitizeArticleHtml(value) {
  return sanitizeHtml(String(value || ''), {
    allowedTags: [
      'a', 'blockquote', 'br', 'em', 'h2', 'h3', 'h4', 'img', 'li', 'ol', 'p', 'strong', 'ul'
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true)
    }
  }).trim();
}

export function validateRevisionInput(input, { allowSlug = false } = {}) {
  const errors = {};
  let schemaMarkup = null;
  const revision = {
    title: stringField(input.title, 'title', 180, errors),
    excerpt: stringField(input.excerpt, 'excerpt', 360, errors),
    category: stringField(input.category, 'category', 80, errors),
    featuredImageUrl: stringField(input.featuredImageUrl, 'featuredImageUrl', 2048, errors),
    featuredImageAlt: stringField(input.featuredImageAlt, 'featuredImageAlt', 250, errors, false),
    seoTitle: stringField(input.seoTitle || input.title, 'seoTitle', 180, errors),
    seoDescription: stringField(input.seoDescription || input.excerpt, 'seoDescription', 360, errors)
  };
  const rawArticleHtml = typeof input.articleHtml === 'string' ? input.articleHtml : '';
  if (!rawArticleHtml.trim()) errors.articleHtml = 'Article content is required.';
  if (rawArticleHtml.length > MAX_ARTICLE_HTML_LENGTH) {
    errors.articleHtml = `Use at most ${MAX_ARTICLE_HTML_LENGTH} characters.`;
  }
  revision.articleHtml = sanitizeArticleHtml(rawArticleHtml);
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