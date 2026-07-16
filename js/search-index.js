(function () {
  'use strict';

  window.SEARCH_INDEX = [
    {
      title: 'Home',
      url: '/',
      category: 'core',
      summary: 'Overview of Network Consultancy services, solutions, and consultation pathways.',
      keywords: ['network consultancy', 'secure networks', 'sme it support'],
      audience: ['non-technical', 'manager', 'technical'],
      intents: ['discover', 'support']
    },
    {
      title: 'About Us',
      url: '/about.html',
      category: 'core',
      summary: 'Who we are, how we work, and why businesses trust our network specialists.',
      keywords: ['about network consultancy', 'company profile', 'who we are'],
      audience: ['non-technical', 'manager'],
      intents: ['discover']
    },
    {
      title: 'Contact',
      url: '/contact.html',
      category: 'core',
      summary: 'Get in touch with our engineers for consultation, support, or project discussions.',
      keywords: ['contact', 'book consultation', 'speak to support', 'enquire'],
      audience: ['non-technical', 'manager', 'technical'],
      intents: ['support', 'contact']
    },
    {
      title: 'Privacy Policy',
      url: '/privacy-policy.html',
      category: 'legal',
      summary: 'How personal and operational data is handled and protected.',
      keywords: ['privacy', 'data policy', 'gdpr'],
      audience: ['manager'],
      intents: ['policy']
    },
    {
      title: 'Terms of Service',
      url: '/terms-of-service.html',
      category: 'legal',
      summary: 'Service terms, responsibilities, and contractual conditions.',
      keywords: ['terms', 'service agreement', 'sla terms'],
      audience: ['manager'],
      intents: ['policy']
    },
    {
      title: 'Cookie Policy',
      url: '/cookie-policy.html',
      category: 'legal',
      summary: 'Cookie usage details and browser control options.',
      keywords: ['cookies', 'tracking policy'],
      audience: ['non-technical', 'manager'],
      intents: ['policy']
    },
    {
      title: 'Complaint Form',
      url: '/complaint-form.html',
      category: 'legal',
      summary: 'Raise service concerns for review and resolution.',
      keywords: ['complaint', 'issue', 'raise concern'],
      audience: ['non-technical', 'manager'],
      intents: ['support', 'policy']
    },

    {
      title: 'Services',
      url: '/services/',
      category: 'services',
      summary: 'Complete service portfolio for infrastructure, security, wireless, and support.',
      keywords: ['services', 'managed services', 'network services'],
      audience: ['non-technical', 'manager', 'technical'],
      intents: ['discover', 'upgrade']
    },
    {
      title: 'Network Consultancy',
      url: '/services/network-consultancy.html',
      category: 'services',
      summary: 'Strategic guidance for designing and improving business networks.',
      keywords: ['consultancy', 'network strategy', 'advice'],
      audience: ['manager', 'technical'],
      intents: ['discover', 'upgrade']
    },
    {
      title: 'Network Design & Deployment',
      url: '/services/network-design-deployment.html',
      category: 'services',
      summary: 'Plan and deploy reliable network architecture for growth.',
      keywords: ['design', 'deployment', 'implementation'],
      audience: ['manager', 'technical'],
      intents: ['upgrade', 'discover']
    },
    {
      title: 'Network Installations',
      url: '/services/network-installations.html',
      category: 'services',
      summary: 'On-site installations for dependable connectivity and performance.',
      keywords: ['install', 'cabling', 'network setup'],
      audience: ['non-technical', 'manager'],
      intents: ['upgrade', 'support']
    },
    {
      title: 'Network Support',
      url: '/services/network-support.html',
      category: 'services',
      summary: 'Responsive support for incidents, outages, and performance problems.',
      keywords: ['support', 'help desk', 'fix network', 'network down'],
      audience: ['non-technical', 'manager', 'technical'],
      intents: ['support', 'troubleshoot']
    },
    {
      title: 'Managed Network Support',
      url: '/services/managed-network-support.html',
      category: 'services',
      summary: 'Proactive monitoring and management for business continuity.',
      keywords: ['managed support', 'outsourced it', '24x7 monitoring'],
      audience: ['manager', 'technical'],
      intents: ['support', 'discover']
    },
    {
      title: 'Managed Wireless LAN',
      url: '/services/managed-wireless-lan.html',
      category: 'services',
      summary: 'Business Wi-Fi planning, optimization, and maintenance.',
      keywords: ['wifi', 'wireless', 'slow wifi', 'office wifi'],
      audience: ['non-technical', 'manager', 'technical'],
      intents: ['troubleshoot', 'upgrade']
    },
    {
      title: 'Firewall & Network Security',
      url: '/services/firewall-network-security.html',
      category: 'services',
      summary: 'Protection against threats through modern firewall and security controls.',
      keywords: ['firewall', 'security', 'cyber', 'threat prevention'],
      audience: ['manager', 'technical'],
      intents: ['security', 'discover']
    },
    {
      title: 'Remote Access & VPN',
      url: '/services/remote-access-vpn.html',
      category: 'services',
      summary: 'Secure remote connectivity for distributed teams and offices.',
      keywords: ['vpn', 'remote access', 'work from home'],
      audience: ['manager', 'technical'],
      intents: ['security', 'support', 'upgrade']
    },
    {
      title: 'Business Continuity & Resilience',
      url: '/services/business-continuity.html',
      category: 'services',
      summary: 'Reduce downtime with resilient network architecture and recovery planning.',
      keywords: ['business continuity', 'resilience', 'downtime', 'disaster recovery'],
      audience: ['manager', 'technical'],
      intents: ['risk', 'security', 'upgrade']
    },

    {
      title: 'Solutions',
      url: '/solutions/',
      category: 'solutions',
      summary: 'Focused assessments and strategic solutions for performance and security.',
      keywords: ['solutions', 'assessment', 'review'],
      audience: ['manager', 'technical'],
      intents: ['discover', 'upgrade']
    },
    {
      title: 'Network Health Check',
      url: '/solutions/network-health-check.html',
      category: 'solutions',
      summary: 'Structured assessment of network weaknesses and practical improvement priorities.',
      keywords: ['health check', 'assessment', 'slow network'],
      audience: ['manager', 'technical'],
      intents: ['troubleshoot', 'upgrade', 'risk']
    },
    {
      title: 'AI-Ready Infrastructure',
      url: '/solutions/ai-ready-infrastructure.html',
      category: 'solutions',
      summary: 'Evaluate readiness for AI workloads across infrastructure, security, and operations.',
      keywords: ['ai readiness', 'ai infrastructure', 'compute readiness'],
      audience: ['manager', 'technical'],
      intents: ['ai', 'upgrade']
    },
    {
      title: 'Cyber Security Review',
      url: '/solutions/cyber-security-review.html',
      category: 'solutions',
      summary: 'Identify vulnerabilities and close security gaps before incidents occur.',
      keywords: ['cyber review', 'security audit', 'vulnerability'],
      audience: ['manager', 'technical'],
      intents: ['security', 'risk']
    },
    {
      title: 'Microsoft 365 & Network',
      url: '/solutions/microsoft-365-network.html',
      category: 'solutions',
      summary: 'Prepare network performance and reliability for Microsoft 365 workloads.',
      keywords: ['microsoft 365', 'm365 slow', 'office 365 network'],
      audience: ['manager', 'technical'],
      intents: ['upgrade', 'troubleshoot']
    },

    {
      title: 'Industries',
      url: '/industries/',
      category: 'industries',
      summary: 'Industry-specific network services and risk-aware implementation.',
      keywords: ['industries', 'sector expertise'],
      audience: ['manager'],
      intents: ['discover']
    },
    { title: 'Financial Services', url: '/industries/financial-services.html', category: 'industries', keywords: ['finance', 'regulated'], audience: ['manager'], intents: ['discover', 'risk'] },
    { title: 'Healthcare & Clinics', url: '/industries/healthcare-clinics.html', category: 'industries', keywords: ['healthcare', 'clinic'], audience: ['manager'], intents: ['discover', 'risk'] },
    { title: 'Internal IT Teams', url: '/industries/internal-it-teams.html', category: 'industries', keywords: ['co-managed it', 'internal team'], audience: ['technical', 'manager'], intents: ['discover', 'support'] },
    { title: 'Legal Firms', url: '/industries/legal-firms.html', category: 'industries', keywords: ['legal', 'law firm'], audience: ['manager'], intents: ['discover', 'risk'] },
    { title: 'Manufacturing', url: '/industries/manufacturing.html', category: 'industries', keywords: ['manufacturing', 'plant network'], audience: ['manager'], intents: ['discover', 'support'] },
    { title: 'Multi-Site Businesses', url: '/industries/multi-site-businesses.html', category: 'industries', keywords: ['multi-site', 'multiple offices'], audience: ['manager', 'technical'], intents: ['discover', 'upgrade'] },
    { title: 'Professional Services', url: '/industries/professional-services.html', category: 'industries', keywords: ['professional services'], audience: ['manager'], intents: ['discover'] },
    { title: 'Recruitment Agencies', url: '/industries/recruitment-agencies.html', category: 'industries', keywords: ['recruitment'], audience: ['manager'], intents: ['discover'] },

    {
      title: 'Resources',
      url: '/resources/',
      category: 'resources',
      summary: 'Guides, downloads, and educational resources for better IT decisions.',
      keywords: ['resources', 'guides', 'downloads'],
      audience: ['non-technical', 'manager', 'technical'],
      intents: ['learn']
    },

    { title: 'Downloads', url: '/resources/downloads.html', category: 'resources', keywords: ['download', 'templates'], audience: ['manager'], intents: ['learn'] },
    { title: 'Guides', url: '/resources/guides.html', category: 'resources', keywords: ['guide', 'playbook'], audience: ['non-technical', 'manager'], intents: ['learn'] },

    {
      title: 'Case Studies',
      url: '/case-studies/',
      category: 'proof',
      summary: 'Real project outcomes from network upgrades and security transformations.',
      keywords: ['case studies', 'results', 'success stories'],
      audience: ['manager', 'technical'],
      intents: ['proof']
    },
    { title: 'Antal International Case Study', url: '/case-studies/antal-international.html', category: 'proof', keywords: ['sase', 'global network'], audience: ['manager', 'technical'], intents: ['proof'] },
    { title: 'Auriga Networks Case Study', url: '/case-studies/auriga-networks.html', category: 'proof', keywords: ['ongoing support', 'media network'], audience: ['manager', 'technical'], intents: ['proof'] },
    { title: 'Harry Dobbs Design Case Study', url: '/case-studies/harry-dobbs-design.html', category: 'proof', keywords: ['modernization', 'small business'], audience: ['non-technical', 'manager'], intents: ['proof'] },
    { title: 'NTA Core Network Upgrade Case Study', url: '/case-studies/nta-core-network-upgrade.html', category: 'proof', keywords: ['core upgrade', 'isp'], audience: ['technical', 'manager'], intents: ['proof'] },
    { title: 'Senate Computers Case Study', url: '/case-studies/senate-computers.html', category: 'proof', keywords: ['multi-site security', 'ipsec'], audience: ['technical', 'manager'], intents: ['proof'] }
  ];
})();
