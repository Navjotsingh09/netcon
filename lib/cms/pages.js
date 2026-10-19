const homeSections = [
  { id: 'hero', label: 'Hero' },
  { id: 'hero-search-strip', label: 'Search' },
  { id: 'partner-strip', label: 'Partner logos' },
  { id: 'main-services', label: 'Core services' },
  { id: 'nd-highlight', label: 'Network infrastructure' },
  { id: 'nd-figma-stack', label: 'Why choose us' },
  { id: 'nd-trusted', label: 'Testimonials' },
  { id: 'nd-faq', label: 'Frequently asked questions' },
  { id: 'nd-contact', label: 'Contact' }
];

const homeFields = [
  { key: 'home.seo.title', label: 'Search title', section: 'hero', type: 'text', property: 'textContent', maxLength: 180 },
  { key: 'home.seo.description', label: 'Search description', section: 'hero', type: 'textarea', property: 'content', maxLength: 360 },
  { key: 'home.hero.cisco.title', label: 'Cisco slide title', section: 'hero', type: 'text', property: 'textContent', maxLength: 120 },
  { key: 'home.hero.cisco.description', label: 'Cisco slide description', section: 'hero', type: 'textarea', property: 'textContent', maxLength: 400 },
  { key: 'home.hero.cisco.cta', label: 'Cisco button text', section: 'hero', type: 'text', property: 'textContent', maxLength: 100 },
  { key: 'home.hero.cisco.ctaUrl', label: 'Cisco button link', section: 'hero', type: 'url', property: 'href', maxLength: 500 },
  { key: 'home.hero.business.title', label: 'Business slide title', section: 'hero', type: 'text', property: 'textContent', maxLength: 120 },
  { key: 'home.hero.business.description', label: 'Business slide description', section: 'hero', type: 'textarea', property: 'textContent', maxLength: 400 },
  { key: 'home.hero.business.cta', label: 'Business button text', section: 'hero', type: 'text', property: 'textContent', maxLength: 100 },
  { key: 'home.hero.business.ctaUrl', label: 'Business button link', section: 'hero', type: 'url', property: 'href', maxLength: 500 },
  { key: 'home.search.placeholder', label: 'Search box placeholder', section: 'hero-search-strip', type: 'text', property: 'placeholder', maxLength: 120 },
  { key: 'home.services.title', label: 'Section heading', section: 'main-services', type: 'text', property: 'textContent', maxLength: 120 },
  { key: 'home.services.intro', label: 'Section introduction', section: 'main-services', type: 'textarea', property: 'textContent', maxLength: 500 },
  { key: 'home.services.cta', label: 'Booking button text', section: 'main-services', type: 'text', property: 'textContent', maxLength: 100 },
  { key: 'home.services.ctaUrl', label: 'Booking button link', section: 'main-services', type: 'url', property: 'href', maxLength: 500 },
  { key: 'home.services.card.linkText', label: 'Service card link text', section: 'main-services', type: 'text', property: 'textContent', maxLength: 80 },
  { key: 'home.highlight.title', label: 'Section heading', section: 'nd-highlight', type: 'text', property: 'textContent', maxLength: 160 },
  { key: 'home.highlight.description', label: 'Section introduction', section: 'nd-highlight', type: 'textarea', property: 'textContent', maxLength: 500 },
  { key: 'home.expertise.card1.title', label: 'First feature title', section: 'nd-figma-stack', type: 'text', property: 'textContent', maxLength: 120 },
  { key: 'home.expertise.card1.description', label: 'First feature description', section: 'nd-figma-stack', type: 'textarea', property: 'textContent', maxLength: 600 },
  { key: 'home.expertise.card1.linkText', label: 'First feature link text', section: 'nd-figma-stack', type: 'text', property: 'textContent', maxLength: 80 },
  { key: 'home.expertise.card1.linkUrl', label: 'First feature link', section: 'nd-figma-stack', type: 'url', property: 'href', maxLength: 500 },
  { key: 'home.expertise.card2.title', label: 'Second feature title', section: 'nd-figma-stack', type: 'text', property: 'textContent', maxLength: 120 },
  { key: 'home.expertise.card2.description', label: 'Second feature description', section: 'nd-figma-stack', type: 'textarea', property: 'textContent', maxLength: 600 },
  { key: 'home.expertise.card2.linkText', label: 'Second feature link text', section: 'nd-figma-stack', type: 'text', property: 'textContent', maxLength: 80 },
  { key: 'home.expertise.card2.linkUrl', label: 'Second feature link', section: 'nd-figma-stack', type: 'url', property: 'href', maxLength: 500 },
  { key: 'home.expertise.card3.title', label: 'Third feature title', section: 'nd-figma-stack', type: 'text', property: 'textContent', maxLength: 120 },
  { key: 'home.expertise.card3.description', label: 'Third feature description', section: 'nd-figma-stack', type: 'textarea', property: 'textContent', maxLength: 600 },
  { key: 'home.expertise.card3.linkText', label: 'Third feature link text', section: 'nd-figma-stack', type: 'text', property: 'textContent', maxLength: 80 },
  { key: 'home.expertise.card3.linkUrl', label: 'Third feature link', section: 'nd-figma-stack', type: 'url', property: 'href', maxLength: 500 },
  { key: 'home.expertise.banner.intro', label: 'Network services introduction', section: 'nd-figma-stack', type: 'textarea', property: 'textContent', maxLength: 300 },
  { key: 'home.testimonials.title', label: 'Section heading', section: 'nd-trusted', type: 'text', property: 'textContent', maxLength: 120 },
  { key: 'home.faq.title', label: 'FAQ heading', section: 'nd-faq', type: 'text', property: 'textContent', maxLength: 120 },
  { key: 'home.faq.intro', label: 'FAQ introduction', section: 'nd-faq', type: 'textarea', property: 'textContent', maxLength: 300 },
  { key: 'home.contact.title', label: 'Contact heading', section: 'nd-contact', type: 'text', property: 'textContent', maxLength: 160 },
  { key: 'home.contact.intro', label: 'Contact introduction', section: 'nd-contact', type: 'textarea', property: 'textContent', maxLength: 500 },
  { key: 'home.contact.phone.label', label: 'Phone tile heading', section: 'nd-contact', type: 'text', property: 'textContent', maxLength: 100 },
  { key: 'home.contact.phone.text', label: 'Phone number', section: 'nd-contact', type: 'text', property: 'textContent', maxLength: 80 },
  { key: 'home.contact.phone.href', label: 'Phone link', section: 'nd-contact', type: 'url', property: 'href', maxLength: 100 },
  { key: 'home.contact.email.label', label: 'Email tile heading', section: 'nd-contact', type: 'text', property: 'textContent', maxLength: 100 },
  { key: 'home.contact.email.text', label: 'Email address', section: 'nd-contact', type: 'text', property: 'textContent', maxLength: 160 },
  { key: 'home.contact.email.href', label: 'Email link', section: 'nd-contact', type: 'url', property: 'href', maxLength: 200 },
  { key: 'home.contact.address.label', label: 'Address tile heading', section: 'nd-contact', type: 'text', property: 'textContent', maxLength: 100 },
  { key: 'home.contact.address', label: 'Business address', section: 'nd-contact', type: 'textarea', property: 'textContent', maxLength: 300 },
  { key: 'home.contact.submit', label: 'Form submit button', section: 'nd-contact', type: 'text', property: 'textContent', maxLength: 80 },
  ...Array.from({ length: 6 }, (_, index) => {
    const number = index + 1;
    return [
      { key: `home.services.card${number}.title`, label: `Service card ${number} title`, section: 'main-services', type: 'textarea', property: 'textContent', maxLength: 120, preserveLines: true },
      { key: `home.services.card${number}.description`, label: `Service card ${number} description`, section: 'main-services', type: 'textarea', property: 'textContent', maxLength: 400 },
      { key: `home.services.card${number}.linkUrl`, label: `Service card ${number} link`, section: 'main-services', type: 'url', property: 'href', maxLength: 500 }
    ];
  }).flat(),
  ...Array.from({ length: 3 }, (_, index) => ({
    key: `home.highlight.bullet${index + 1}`,
    label: `Network benefit ${index + 1}`,
    section: 'nd-highlight',
    type: 'text',
    property: 'textContent',
    maxLength: 160
  })),
  { key: 'home.expertise.banner.title1', label: 'Network services banner heading', section: 'nd-figma-stack', type: 'text', property: 'textContent', maxLength: 100 },
  { key: 'home.expertise.banner.title2', label: 'Network services banner second line', section: 'nd-figma-stack', type: 'text', property: 'textContent', maxLength: 100 },
  ...Array.from({ length: 4 }, (_, index) => ({
    key: `home.expertise.banner.bullet${index + 1}`,
    label: `Network services point ${index + 1}`,
    section: 'nd-figma-stack',
    type: 'textarea',
    property: 'textContent',
    maxLength: 240
  })),
  ...Array.from({ length: 5 }, (_, index) => {
    const number = index + 1;
    return [
      { key: `home.testimonials.quote${number}`, label: `Testimonial ${number} quote`, section: 'nd-trusted', type: 'textarea', property: 'textContent', maxLength: 700 },
      { key: `home.testimonials.name${number}`, label: `Testimonial ${number} name`, section: 'nd-trusted', type: 'text', property: 'textContent', maxLength: 120 },
      { key: `home.testimonials.role${number}`, label: `Testimonial ${number} role`, section: 'nd-trusted', type: 'text', property: 'textContent', maxLength: 180 }
    ];
  }).flat(),
  { key: 'home.faq.cta', label: 'FAQ contact link text', section: 'nd-faq', type: 'text', property: 'textContent', maxLength: 80 },
  { key: 'home.faq.ctaUrl', label: 'FAQ contact link', section: 'nd-faq', type: 'url', property: 'href', maxLength: 500 },
  ...Array.from({ length: 3 }, (_, index) => {
    const number = index + 1;
    return [
      { key: `home.faq.question${number}`, label: `FAQ question ${number}`, section: 'nd-faq', type: 'text', property: 'textContent', maxLength: 200 },
      { key: `home.faq.answer${number}`, label: `FAQ answer ${number}`, section: 'nd-faq', type: 'textarea', property: 'textContent', maxLength: 800 }
    ];
  }).flat()
];

export const CMS_PAGE_DEFINITIONS = [{
  slug: 'home',
  title: 'Home page',
  path: '/',
  sections: homeSections,
  fields: homeFields
}, ...[
  ['about', 'About Us', '/about.html'],
  ['contact', 'Contact Us', '/contact.html'],
  ['services', 'Services', '/services/index.html'],
  ['services-business-continuity-and-network-resilience', 'Business Continuity and Network Resilience', '/services/business-continuity-and-network-resilience.html'],
  ['services-firewall-and-network-security', 'Firewall and Network Security', '/services/firewall-and-network-security.html'],
  ['services-managed-network-support', 'Managed Network Support', '/services/managed-network-support.html'],
  ['services-managed-wireless-lan', 'Managed Wireless LAN', '/services/managed-wireless-lan.html'],
  ['services-network-consultancy', 'Network Consultancy', '/services/network-consultancy.html'],
  ['services-network-design-and-deployment', 'Network Design and Deployment', '/services/network-design-and-deployment.html'],
  ['services-network-installations', 'Network Installations', '/services/network-installations.html'],
  ['services-network-support', 'Network Support', '/services/network-support.html'],
  ['services-remote-working-solutions', 'Remote Working Solutions', '/services/remote-working-solutions.html'],
  ['solutions', 'Solutions', '/solutions/index.html'],
  ['solutions-ai-ready-infrastructure-review', 'AI-Ready Infrastructure Review', '/solutions/ai-ready-infrastructure-review.html'],
  ['solutions-cyber-security-review', 'Cyber Security Review', '/solutions/cyber-security-review.html'],
  ['solutions-microsoft-365-and-network-readiness', 'Microsoft 365 and Network Readiness', '/solutions/microsoft-365-and-network-readiness.html'],
  ['solutions-network-health-check', 'Network Health Check', '/solutions/network-health-check.html'],
  ['industries', 'Industries', '/industries/index.html'],
  ['industries-charity', 'Charity', '/industries/charity.html'],
  ['industries-educational-institutes', 'Educational Institutes', '/industries/educational-institutes.html'],
  ['industries-financial-services', 'Financial Services', '/industries/financial-services.html'],
  ['industries-healthcare-and-clinics', 'Healthcare and Clinics', '/industries/healthcare-and-clinics.html'],
  ['industries-internal-it-teams', 'Internal IT Teams', '/industries/internal-it-teams.html'],
  ['industries-legal-firms', 'Legal Firms', '/industries/legal-firms.html'],
  ['industries-manufacturing', 'Manufacturing', '/industries/manufacturing.html'],
  ['industries-multi-site-businesses', 'Multi-Site Businesses', '/industries/multi-site-businesses.html'],
  ['industries-recruitment-agencies', 'Recruitment Agencies', '/industries/recruitment-agencies.html'],
  ['resources', 'Resources', '/resources/index.html'],
  ['resources-downloads', 'Downloads', '/resources/downloads.html'],
  ['resources-guides', 'Guides', '/resources/guides.html'],
  ['case-studies', 'Case Studies', '/case-studies/index.html'],
  ['case-studies-antal-international', 'Antal International Case Study', '/case-studies/antal-international.html'],
  ['case-studies-auriga-networks', 'Auriga Networks Case Study', '/case-studies/auriga-networks.html'],
  ['case-studies-harry-dobbs-design', 'Harry Dobbs Design Case Study', '/case-studies/harry-dobbs-design.html'],
  ['case-studies-nta-core-network-upgrade', 'NTA Core Network Upgrade Case Study', '/case-studies/nta-core-network-upgrade.html'],
  ['case-studies-senate-computers', 'Senate Computers Case Study', '/case-studies/senate-computers.html']
].map(([slug, title, path]) => ({
  slug,
  title,
  path,
  sections: [],
  fields: [],
  dynamic: true
}))];

const definitionsBySlug = new Map(CMS_PAGE_DEFINITIONS.map((page) => [page.slug, page]));

export function getCmsPageDefinition(slug) {
  return definitionsBySlug.get(slug) || null;
}

function isSafeUrl(value, property) {
  if (/[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
  if (!value) return true;
  if (property === 'href') {
    if (/^#/.test(value)) return true;
    if (/^tel:/i.test(value)) return /^tel:\+?[0-9().-]+(?:;ext=\d+)?$/i.test(value);
    if (/^mailto:/i.test(value)) {
      try {
        const url = new URL(value);
        return url.protocol === 'mailto:' && Boolean(url.pathname) && !url.search && !url.hash;
      } catch {
        return false;
      }
    }
  }
  if (/^https:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
    } catch {
      return false;
    }
  }
  if (value.startsWith('/') && !value.startsWith('//')) {
    try {
      return new URL(value, 'https://cms.invalid').hostname === 'cms.invalid';
    } catch {
      return false;
    }
  }
  return false;
}

const dynamicPathTags = new Set([
  'a', 'address', 'article', 'aside', 'b', 'blockquote', 'button', 'caption', 'dd', 'div', 'dl', 'dt',
  'em', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'i', 'label',
  'li', 'main', 'ol', 'p', 'section', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td',
  'th', 'thead', 'tr', 'u', 'ul'
]);
const dynamicTextTags = new Set(['a', 'blockquote', 'button', 'em', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'p', 'small', 'span', 'strong']);

function validDynamicPath(path, requiredFinalTags) {
  if (!path) return requiredFinalTags.has('main');
  const segments = path.split('/');
  if (segments.some((part) => {
    const match = /^([a-z][a-z0-9-]*)\[([1-9]\d*)\]$/.exec(part);
    return !match || !dynamicPathTags.has(match[1]);
  })) return false;
  return requiredFinalTags.has(segments[segments.length - 1].match(/^([a-z][a-z0-9-]*)\[/)[1]);
}

function validDynamicFieldKey(key) {
  if (key === 'meta:title' || key === 'meta:description') return true;
  const textMatch = /^t:(.*)#(0|[1-9]\d*)$/.exec(key);
  if (textMatch) return validDynamicPath(textMatch[1], dynamicTextTags);
  const urlMatch = /^u:(.*)$/.exec(key);
  return Boolean(urlMatch && validDynamicPath(urlMatch[1], new Set(['a'])));
}

export function validatePageContent(definition, input) {
  const errors = {};
  const incomingFields = input?.fields;
  const incomingOrder = input?.sectionOrder;
  if (!incomingFields || typeof incomingFields !== 'object' || Array.isArray(incomingFields)) {
    errors.fields = 'Page fields must be an object.';
  }
  if (definition.dynamic) {
    const fields = {};
    for (const [key, value] of Object.entries(incomingFields || {})) {
      if (!validDynamicFieldKey(key) || typeof value !== 'string') {
        errors.fields = 'The page contains an unsupported field.';
        continue;
      }
      const normalized = key.startsWith('t:') ? value : value.trim();
      const maxLength = key.startsWith('u:') ? 500 : key === 'meta:title' ? 180 : key === 'meta:description' ? 360 : 5000;
      if (normalized.length > maxLength) {
        errors[key] = `Use at most ${maxLength} characters.`;
        continue;
      }
      if (key.startsWith('u:') && !isSafeUrl(normalized, 'href')) {
        errors[key] = 'Use an HTTPS, mailto, tel, site-relative, or anchor link.';
        continue;
      }
      fields[key] = normalized;
    }
    const sectionOrder = Array.isArray(incomingOrder) ? incomingOrder : [];
    if (!Array.isArray(incomingOrder) || sectionOrder.length !== 0) {
      errors.sectionOrder = 'Page section order cannot be changed.';
    }
    if (JSON.stringify({ fields, sectionOrder }).length > 200000) errors.fields = 'The page content is too large.';
    return { errors, content: { fields, sectionOrder } };
  }
  if (!Array.isArray(incomingOrder)) {
    errors.sectionOrder = 'Choose an order for the page sections.';
  }

  const fields = {};
  for (const field of definition.fields) {
    const value = incomingFields?.[field.key];
    if (typeof value !== 'string') {
      errors[field.key] = 'Enter text for this field.';
      continue;
    }
    const normalized = value.trim();
    if (normalized.length > field.maxLength) {
      errors[field.key] = `Use at most ${field.maxLength} characters.`;
      continue;
    }
    if (field.type === 'url' && !isSafeUrl(normalized, field.property)) {
      errors[field.key] = 'Use an HTTPS, mailto, tel, site-relative, or anchor link.';
      continue;
    }
    fields[field.key] = normalized;
  }

  if (incomingFields && Object.keys(incomingFields).some((key) => !definition.fields.some((field) => field.key === key))) {
    errors.fields = 'The page contains an unsupported field.';
  }

  const allowedSections = definition.sections.map((section) => section.id);
  const sectionOrder = Array.isArray(incomingOrder) ? incomingOrder : [];
  if (
    sectionOrder.length !== allowedSections.length
    || new Set(sectionOrder).size !== allowedSections.length
    || sectionOrder.some((id) => !allowedSections.includes(id))
  ) {
    errors.sectionOrder = 'The page section order is incomplete or invalid.';
  }

  if (JSON.stringify({ fields, sectionOrder }).length > 100000) {
    errors.fields = 'The page content is too large.';
  }
  return { errors, content: { fields, sectionOrder } };
}
