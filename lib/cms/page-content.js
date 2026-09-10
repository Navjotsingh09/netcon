export const pilotPages = {
  home: { label: 'Home', path: '/' },
  about: { label: 'About Us', path: '/about' },
  contact: { label: 'Contact Us', path: '/contact' },
  services: { label: 'Services Landing', path: '/services' },
  'network-consultancy': { label: 'Services → Network Consultancy', path: '/services/network-consultancy' },
  'business-continuity-and-network-resilience': { label: 'Services → Business Continuity & Network Resilience', path: '/services/business-continuity-and-network-resilience' },
  'firewall-and-network-security': { label: 'Services → Firewall & Network Security', path: '/services/firewall-and-network-security' },
  'managed-network-support': { label: 'Services → Managed Network Support', path: '/services/managed-network-support' },
  'managed-wireless-lan': { label: 'Services → Managed Wireless LAN', path: '/services/managed-wireless-lan' },
  'network-design-and-deployment': { label: 'Services → Network Design & Deployment', path: '/services/network-design-and-deployment' },
  'network-installations': { label: 'Services → Network Installations', path: '/services/network-installations' },
  'network-support': { label: 'Services → Network Support', path: '/services/network-support' },
  'remote-working-solutions': { label: 'Services → Remote Access & VPN', path: '/services/remote-working-solutions' }
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