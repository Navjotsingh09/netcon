export const pilotPages = {
  home: { label: 'Home', path: '/' },
  about: { label: 'About Us', path: '/about' },
  contact: { label: 'Contact Us', path: '/contact' },
  'privacy-policy': { label: 'Privacy Policy', path: '/privacy-policy' },
  'terms-of-service': { label: 'Terms of Service', path: '/terms-of-service' },
  'cookie-policy': { label: 'Cookie Policy', path: '/cookie-policy' },
  accessibility: { label: 'Accessibility Statement', path: '/accessibility' },
  'complaint-form': { label: 'Complaint Form', path: '/complaint-form' },
  'contact-form': { label: 'Contact Form', path: '/contact-form' },
  services: { label: 'Services Landing', path: '/services' },
  'network-consultancy': { label: 'Services → Network Consultancy', path: '/services/network-consultancy' },
  'business-continuity-and-network-resilience': { label: 'Services → Business Continuity & Network Resilience', path: '/services/business-continuity-and-network-resilience' },
  'firewall-and-network-security': { label: 'Services → Firewall & Network Security', path: '/services/firewall-and-network-security' },
  'managed-network-support': { label: 'Services → Managed Network Support', path: '/services/managed-network-support' },
  'managed-wireless-lan': { label: 'Services → Managed Wireless LAN', path: '/services/managed-wireless-lan' },
  'network-design-and-deployment': { label: 'Services → Network Design & Deployment', path: '/services/network-design-and-deployment' },
  'network-installations': { label: 'Services → Network Installations', path: '/services/network-installations' },
  'network-support': { label: 'Services → Network Support', path: '/services/network-support' },
  'remote-working-solutions': { label: 'Services → Remote Access & VPN', path: '/services/remote-working-solutions' },
  'industries-landing': { label: 'Industries Landing', path: '/industries' },
  'industries-charity': { label: 'Industries → Charity', path: '/industries/charity' },
  'industries-educational-institutes': { label: 'Industries → Educational Institutes', path: '/industries/educational-institutes' },
  'industries-financial-services': { label: 'Industries → Financial Services', path: '/industries/financial-services' },
  'industries-healthcare-and-clinics': { label: 'Industries → Healthcare & Clinics', path: '/industries/healthcare-and-clinics' },
  'industries-internal-it-teams': { label: 'Industries → Internal IT Teams', path: '/industries/internal-it-teams' },
  'industries-legal-firms': { label: 'Industries → Legal Firms', path: '/industries/legal-firms' },
  'industries-manufacturing': { label: 'Industries → Manufacturing', path: '/industries/manufacturing' },
  'industries-multi-site-businesses': { label: 'Industries → Multi-Site Businesses', path: '/industries/multi-site-businesses' },
  'industries-recruitment-agencies': { label: 'Industries → Recruitment Agencies', path: '/industries/recruitment-agencies' },
  'solutions-landing': { label: 'Solutions Landing', path: '/solutions' },
  'solutions-ai-ready-infrastructure-review': { label: 'Solutions → AI-Ready Infrastructure Review', path: '/solutions/ai-ready-infrastructure-review' },
  'solutions-cyber-security-review': { label: 'Solutions → Cyber Security Review', path: '/solutions/cyber-security-review' },
  'solutions-network-health-check': { label: 'Solutions → Network Health Check', path: '/solutions/network-health-check' },
  'resources-landing': { label: 'Resources Landing', path: '/resources' },
  'resources-downloads': { label: 'Resources → Downloads', path: '/resources/downloads' },
  'resources-guides': { label: 'Resources → Guides', path: '/resources/guides' },
  'case-studies-landing': { label: 'Case Studies Landing', path: '/case-studies' },
  'case-studies-antal-international': { label: 'Case Studies → Antal International', path: '/case-studies/antal-international' },
  'case-studies-auriga-networks': { label: 'Case Studies → Auriga Networks', path: '/case-studies/auriga-networks' },
  'case-studies-harry-dobbs-design': { label: 'Case Studies → Harry Dobbs Design', path: '/case-studies/harry-dobbs-design' },
  'case-studies-nta-core-network-upgrade': { label: 'Case Studies → NTA Core Network Upgrade', path: '/case-studies/nta-core-network-upgrade' },
  'case-studies-senate-computers': { label: 'Case Studies → Senate Computers', path: '/case-studies/senate-computers' }
};

const allowedKeys = new Set([
  'seo.title',
  'seo.description',
  'seo.ogTitle',
  'seo.ogDescription',
  'seo.schemaMarkup',
  'seo.canonicalUrl',
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