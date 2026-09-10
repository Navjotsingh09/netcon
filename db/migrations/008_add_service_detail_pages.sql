-- Allow the 9 service detail page slugs in the CMS pages/preview-token tables.
ALTER TABLE cms_pages DROP CONSTRAINT cms_pages_page_slug_check;
ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_page_slug_check CHECK (page_slug IN (
  'home', 'about', 'contact', 'services',
  'network-consultancy', 'business-continuity-and-network-resilience', 'firewall-and-network-security',
  'managed-network-support', 'managed-wireless-lan', 'network-design-and-deployment',
  'network-installations', 'network-support', 'remote-working-solutions'
));

ALTER TABLE cms_preview_tokens DROP CONSTRAINT cms_preview_tokens_page_slug_check;
ALTER TABLE cms_preview_tokens ADD CONSTRAINT cms_preview_tokens_page_slug_check CHECK (page_slug IN (
  'home', 'about', 'contact', 'services',
  'network-consultancy', 'business-continuity-and-network-resilience', 'firewall-and-network-security',
  'managed-network-support', 'managed-wireless-lan', 'network-design-and-deployment',
  'network-installations', 'network-support', 'remote-working-solutions'
));
