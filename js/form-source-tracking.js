/**
 * Form Source Tracking — Web3Forms integration
 * Captures and persists inquiry source data across page navigations and form submissions
 */
(function () {
  'use strict';

  // ========== PAGE-BASED DEFAULTS ==========
  // Map page paths to default inquiry types for pages without explicit CTAs
  var pageDefaults = {
    '/': { family: 'home', page: 'home', cta: 'shared_footer_form' },
    '/index': { family: 'home', page: 'home', cta: 'shared_footer_form' },
    '/about': { family: 'about', page: 'about', cta: 'shared_footer_form' },
    '/contact': { family: 'contact', page: 'contact', cta: 'contact_page_direct' },
    '/contact-form': { family: 'contact', page: 'contact_form', cta: 'contact_form' },
    '/complaint-form': { family: 'contact', page: 'complaint_form', cta: 'complaint_form' },
    '/privacy-policy': { family: 'legal', page: 'privacy_policy', cta: 'shared_footer_form' },
    '/terms-of-service': { family: 'legal', page: 'terms_of_service', cta: 'shared_footer_form' },
    '/cookie-policy': { family: 'legal', page: 'cookie_policy', cta: 'shared_footer_form' },
    '/services/': { family: 'services', page: 'services_index', cta: 'shared_footer_form' },
    '/services/network-consultancy': { family: 'services', page: 'network_consultancy', cta: 'shared_footer_form' },
    '/services/network-design-and-deployment': { family: 'services', page: 'network_design_deployment', cta: 'shared_footer_form' },
    '/services/network-installations': { family: 'services', page: 'network_installations', cta: 'shared_footer_form' },
    '/services/network-support': { family: 'services', page: 'network_support', cta: 'shared_footer_form' },
    '/services/managed-network-support': { family: 'services', page: 'managed_network_support', cta: 'shared_footer_form' },
    '/services/managed-wireless-lan': { family: 'services', page: 'managed_wireless_lan', cta: 'shared_footer_form' },
    '/services/remote-working-solutions': { family: 'services', page: 'remote_access_vpn', cta: 'shared_footer_form' },
    '/services/firewall-and-network-security': { family: 'services', page: 'firewall_network_security', cta: 'shared_footer_form' },
    '/services/business-continuity-and-network-resilience': { family: 'services', page: 'business_continuity', cta: 'shared_footer_form' },
    '/solutions/': { family: 'solutions', page: 'solutions_index', cta: 'shared_footer_form' },
    '/solutions/network-health-check': { family: 'solutions', page: 'network_health_check', cta: 'shared_footer_form' },
    '/solutions/ai-ready-infrastructure-review': { family: 'solutions', page: 'ai_ready_infrastructure', cta: 'shared_footer_form' },
    '/solutions/cyber-security-review': { family: 'solutions', page: 'cyber_security_review', cta: 'shared_footer_form' },
    '/solutions/microsoft-365-and-network-readiness': { family: 'solutions', page: 'microsoft_365_network', cta: 'shared_footer_form' },
    '/industries/': { family: 'industries', page: 'industries_index', cta: 'shared_footer_form' },
    '/industries/financial-services': { family: 'industries', page: 'financial_services', cta: 'shared_footer_form' },
    '/industries/healthcare-and-clinics': { family: 'industries', page: 'healthcare_clinics', cta: 'shared_footer_form' },
    '/industries/legal-firms': { family: 'industries', page: 'legal_firms', cta: 'shared_footer_form' },
    '/industries/manufacturing': { family: 'industries', page: 'manufacturing', cta: 'shared_footer_form' },
    '/industries/multi-site-businesses': { family: 'industries', page: 'multi_site_businesses', cta: 'shared_footer_form' },
    '/industries/professional-services': { family: 'industries', page: 'professional_services', cta: 'shared_footer_form' },
    '/industries/recruitment-agencies': { family: 'industries', page: 'recruitment_agencies', cta: 'shared_footer_form' },
    '/industries/internal-it-teams': { family: 'industries', page: 'internal_it_teams', cta: 'shared_footer_form' },
    '/resources/': { family: 'resources', page: 'resources_index', cta: 'shared_footer_form' },
    '/resources/guides': { family: 'resources', page: 'guides', cta: 'shared_footer_form' },
    '/resources/downloads': { family: 'resources', page: 'downloads', cta: 'shared_footer_form' },
    '/resources/blogs/': { family: 'resources', page: 'blog_index', cta: 'shared_footer_form' },
    '/resources/blogs/network-design-implementation': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/resilient-network-design': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/wireless-vs-wired-networks': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/wireless-security-solutions': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/cloud-networking-benefits': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/network-validation': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/cloud-networking-efficiency': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/professional-it-services': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/wlan-guide': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/continuous-network-monitoring': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/remote-work-network-security': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/secure-hybrid-workspace': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/sme-network-consultancy': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/network-consultancy-services': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/network-upgrade-benefits': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/cisco-network-convergence-system': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/cisco-security-solutions': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/resources/blogs/network-consultant-benefits': { family: 'resources', page: 'blog_post', cta: 'shared_footer_form' },
    '/case-studies/': { family: 'case_studies', page: 'case_studies_index', cta: 'shared_footer_form' },
    '/case-studies/antal-international': { family: 'case_studies', page: 'antal_international', cta: 'shared_footer_form' },
    '/case-studies/auriga-networks': { family: 'case_studies', page: 'auriga_networks', cta: 'shared_footer_form' },
    '/case-studies/harry-dobbs-design': { family: 'case_studies', page: 'harry_dobbs_design', cta: 'shared_footer_form' },
    '/case-studies/nta-core-network-upgrade': { family: 'case_studies', page: 'nta_core_network_upgrade', cta: 'shared_footer_form' },
    '/case-studies/senate-computers': { family: 'case_studies', page: 'senate_computers', cta: 'shared_footer_form' }
  };

  // ========== INQUIRY TYPE & LEAD MAPPING ==========
  var inquiryTypeMap = {
    'general_inquiry': { lead_status: 'non_lead', action_required: 'review_only', routing_team: 'admin' },
    'network_health_check': { lead_status: 'lead', action_required: 'pursue_lead', routing_team: 'sales' },
    'technical_consultation': { lead_status: 'lead', action_required: 'pursue_lead', routing_team: 'sales' },
    'project_inquiry': { lead_status: 'lead', action_required: 'pursue_lead', routing_team: 'sales' },
    'support_request': { lead_status: 'non_lead', action_required: 'respond_support', routing_team: 'support' },
    'complaint': { lead_status: 'non_lead', action_required: 'respond_priority', routing_team: 'management' },
    'partnership_inquiry': { lead_status: 'non_lead', action_required: 'review_business_dev', routing_team: 'management' }
  };

  // ========== CTA TO INQUIRY TYPE MAPPING ==========
  var ctaInquiryTypeMap = {
    'hero_health_check': 'network_health_check',
    'solutions_panel_cta': 'technical_consultation',
    'scroll_banner_assessment': 'network_health_check',
    'about_health_check': 'network_health_check',
    'about_consultation_cta': 'technical_consultation',
    'services_landing_health_check': 'network_health_check',
    'services_landing_request_band': 'project_inquiry',
    'service_hero_health_check': 'network_health_check',
    'service_cta_band_request': 'project_inquiry',
    'solutions_landing_health_check': 'network_health_check',
    'solutions_landing_assessment': 'network_health_check',
    'solution_hero_health_check': 'network_health_check',
    'solution_secondary_review': 'technical_consultation',
    'solution_secondary_assessment': 'technical_consultation',
    'solution_secondary_readiness': 'technical_consultation',
    'solution_secondary_health_check': 'network_health_check',
    'industry_health_check': 'network_health_check',
    'industry_get_in_touch': 'general_inquiry',
    'case_studies_consultation': 'technical_consultation',
    'case_studies_assessment': 'network_health_check',
    'case_study_detail_assessment': 'network_health_check',
    'blog_consultation': 'technical_consultation',
    'downloads_inline_contact': 'general_inquiry',
    'contact_page_direct': 'general_inquiry',
    'contact_form': 'general_inquiry',
    'complaint_form': 'complaint',
    'shared_footer_form': 'general_inquiry'
  };

  // ========== GLOBAL OBJECT ==========
  window.NetConSource = {
    // Current source context
    source_page: 'unknown',
    source_family: 'unknown',
    source_cta: 'shared_footer_form',
    inquiry_type: 'general_inquiry',
    lead_status: 'non_lead',
    action_required: 'review_only',
    routing_team: 'admin',

    // Initialize based on current page
    init: function () {
      var path = window.location.pathname;
      var matched = false;
      var candidates = [path];

      if (path !== '/' && path.charAt(path.length - 1) !== '/' && path.indexOf('') === -1) {
        candidates.push(path + '');
      }

      if (path !== '/' && path.charAt(path.length - 1) !== '/') {
        candidates.push(path + '/');
      }

      // Try exact match first
      for (var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
        if (pageDefaults[candidates[candidateIndex]]) {
          this.setFromDefaults(pageDefaults[candidates[candidateIndex]]);
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Try path prefix matches
        for (var pagePath in pageDefaults) {
          if (pagePath === '/') {
            continue;
          }

          for (var prefixIndex = 0; prefixIndex < candidates.length; prefixIndex++) {
            if (candidates[prefixIndex].indexOf(pagePath) === 0) {
              this.setFromDefaults(pageDefaults[pagePath]);
              matched = true;
              break;
            }
          }

          if (matched) {
            break;
          }
        }
      }

      if (!matched) {
        this.setFromDefaults({ family: 'other', page: path, cta: 'shared_footer_form' });
      }

      this.updateInquiryType();
    },

    setFromDefaults: function (defaults) {
      this.source_page = defaults.page || 'unknown';
      this.source_family = defaults.family || 'unknown';
      this.source_cta = defaults.cta || 'shared_footer_form';
    },

    // When a CTA is clicked, call this to update source
    onCTAClick: function (ctaIdentifier) {
      if (ctaInquiryTypeMap[ctaIdentifier]) {
        this.source_cta = ctaIdentifier;
        this.updateInquiryType();
      }
    },

    // Update inquiry_type and derived fields based on source_cta
    updateInquiryType: function () {
      this.inquiry_type = ctaInquiryTypeMap[this.source_cta] || 'general_inquiry';
      var mapping = inquiryTypeMap[this.inquiry_type] || inquiryTypeMap['general_inquiry'];
      this.lead_status = mapping.lead_status;
      this.action_required = mapping.action_required;
      this.routing_team = mapping.routing_team;
    },

    // Get all fields as object (for form submission)
    toObject: function () {
      return {
        source_page: this.source_page,
        source_family: this.source_family,
        source_cta: this.source_cta,
        inquiry_type: this.inquiry_type,
        lead_status: this.lead_status,
        action_required: this.action_required,
        routing_team: this.routing_team
      };
    }
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.NetConSource.init();
    });
  } else {
    window.NetConSource.init();
  }

  // Attach CTA click handlers globally
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-source-cta]');
    if (link) {
      var ctaId = link.getAttribute('data-source-cta');
      window.NetConSource.onCTAClick(ctaId);
    }
  }, true);
}());
