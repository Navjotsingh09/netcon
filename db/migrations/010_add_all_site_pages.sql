-- Idempotent: safe to run even if already applied.
-- Expands cms_pages/cms_preview_tokens page_slug constraints from 13 pilot pages to all 42 real site pages.
ALTER TABLE cms_pages DROP CONSTRAINT IF EXISTS cms_pages_page_slug_check;
ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_page_slug_check CHECK (page_slug IN (
  'home', 'about', 'contact',
  'privacy-policy', 'terms-of-service', 'cookie-policy', 'accessibility', 'complaint-form', 'contact-form',
  'services',
  'network-consultancy', 'business-continuity-and-network-resilience', 'firewall-and-network-security',
  'managed-network-support', 'managed-wireless-lan', 'network-design-and-deployment',
  'network-installations', 'network-support', 'remote-working-solutions',
  'industries-landing', 'industries-charity', 'industries-educational-institutes', 'industries-financial-services',
  'industries-healthcare-and-clinics', 'industries-internal-it-teams', 'industries-legal-firms',
  'industries-manufacturing', 'industries-multi-site-businesses', 'industries-recruitment-agencies',
  'solutions-landing', 'solutions-ai-ready-infrastructure-review', 'solutions-cyber-security-review',
  'solutions-network-health-check',
  'resources-landing', 'resources-downloads', 'resources-guides',
  'case-studies-landing', 'case-studies-antal-international', 'case-studies-auriga-networks',
  'case-studies-harry-dobbs-design', 'case-studies-nta-core-network-upgrade', 'case-studies-senate-computers'
));

ALTER TABLE cms_preview_tokens DROP CONSTRAINT IF EXISTS cms_preview_tokens_page_slug_check;
ALTER TABLE cms_preview_tokens ADD CONSTRAINT cms_preview_tokens_page_slug_check CHECK (page_slug IN (
  'home', 'about', 'contact',
  'privacy-policy', 'terms-of-service', 'cookie-policy', 'accessibility', 'complaint-form', 'contact-form',
  'services',
  'network-consultancy', 'business-continuity-and-network-resilience', 'firewall-and-network-security',
  'managed-network-support', 'managed-wireless-lan', 'network-design-and-deployment',
  'network-installations', 'network-support', 'remote-working-solutions',
  'industries-landing', 'industries-charity', 'industries-educational-institutes', 'industries-financial-services',
  'industries-healthcare-and-clinics', 'industries-internal-it-teams', 'industries-legal-firms',
  'industries-manufacturing', 'industries-multi-site-businesses', 'industries-recruitment-agencies',
  'solutions-landing', 'solutions-ai-ready-infrastructure-review', 'solutions-cyber-security-review',
  'solutions-network-health-check',
  'resources-landing', 'resources-downloads', 'resources-guides',
  'case-studies-landing', 'case-studies-antal-international', 'case-studies-auriga-networks',
  'case-studies-harry-dobbs-design', 'case-studies-nta-core-network-upgrade', 'case-studies-senate-computers'
));
