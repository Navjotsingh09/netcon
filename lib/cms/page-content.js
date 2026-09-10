export const pilotPages = {
  home: { label: 'Home', path: '/' },
  about: { label: 'About Us', path: '/about' },
  contact: { label: 'Contact Us', path: '/contact' },
  services: { label: 'Services Landing', path: '/services' }
};

const allowedKeys = new Set([
  'seo.title',
  'seo.description',
  'seo.ogTitle',
  'seo.ogDescription',
  'seo.schemaMarkup',
  'content'
]);

export function validatePageContent(content) {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return { error: 'Page content must be an object.' };
  }
  const unknownKeys = Object.keys(content).filter((key) => !allowedKeys.has(key));
  if (unknownKeys.length) return { error: `Unsupported page fields: ${unknownKeys.join(', ')}` };
  if (content['seo.schemaMarkup'] !== undefined) {
    try {
      const schema = typeof content['seo.schemaMarkup'] === 'string'
        ? JSON.parse(content['seo.schemaMarkup'])
        : content['seo.schemaMarkup'];
      if (!schema || typeof schema !== 'object' || Array.isArray(schema)) throw new Error('invalid');
    } catch {
      return { error: 'Schema markup must be valid JSON.' };
    }
  }
  return { value: content };
}

export function pageFromSlug(slug) {
  return pilotPages[slug] || null;
}