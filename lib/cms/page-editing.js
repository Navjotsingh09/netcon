import { PageContentError } from './page-renderer.js';

export const advancedPageFields = new Set([
  'meta:canonical', 'meta:robots', 'meta:schema', 'meta:redirect', 'meta:redirectStatus'
]);

export function restrictPageSettings(user, content, baseline) {
  if (user.role === 'reviewer') return content;
  const fields = { ...content.fields };
  for (const key of advancedPageFields) {
    const saved = baseline.fields[key] ?? '';
    if (key in fields && fields[key] !== saved) {
      throw new PageContentError('Only reviewers can change advanced SEO and redirect settings.', {
        [key]: 'Ask a reviewer to change this setting.'
      });
    }
    fields[key] = saved;
  }
  return { ...content, fields };
}
