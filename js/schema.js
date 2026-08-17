// ===== SITEWIDE SCHEMA MARKUP =====
// Injects Organization, LocalBusiness (ProfessionalService), and WebSite
// JSON-LD schema into <head> on every page that loads this script.
// Maintain schema data here ONCE — do not duplicate in individual pages.

(function injectSitewideSchema() {
  'use strict';

  var schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://network-consultancy.com/#organization",
      "name": "Network Consultancy",
      "url": "https://network-consultancy.com/",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://network-consultancy.com/#logo",
        "url": "https://network-consultancy.com/images/misc/logo.png",
        "contentUrl": "https://network-consultancy.com/images/misc/logo.png"
      },
      "image": {
        "@id": "https://network-consultancy.com/#logo"
      },
      "description": "Network Consultancy provides specialist network consultancy, managed network services, IT network support, Cisco consultancy, cybersecurity, network design, implementation, maintenance and business continuity solutions across the UK and worldwide.",
      "email": "info@network-consultancy.com",
      "telephone": "+44 203 150 1401",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Beech House, Greenfield Crescent, Edgbaston",
        "addressLocality": "Birmingham",
        "postalCode": "B15 3BE",
        "addressCountry": "GB"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+44 203 150 1401",
        "email": "info@network-consultancy.com",
        "contactType": "Customer Service",
        "availableLanguage": "English",
        "areaServed": "GB"
      },
      "sameAs": [
        "https://www.facebook.com/NetConSupport/",
        "https://www.instagram.com/netcon_1/",
        "https://www.linkedin.com/company/netconsupport/",
        "http://twitter.com/NetConSupport"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": "https://network-consultancy.com/#localbusiness",
      "name": "Network Consultancy",
      "url": "https://network-consultancy.com/",
      "image": "https://network-consultancy.com/images/misc/logo.png",
      "logo": "https://network-consultancy.com/images/misc/logo.png",
      "description": "Network Consultancy provides expert network consultancy, network design, deployment, installation, managed network support, wireless networking, firewall security, VPN and business continuity services for organisations across the UK and worldwide.",
      "telephone": "+44 203 150 1401",
      "email": "info@network-consultancy.com",
      "priceRange": "££",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Beech House, Greenfield Crescent",
        "addressLocality": "Edgbaston",
        "addressRegion": "Birmingham",
        "postalCode": "B15 3BE",
        "addressCountry": "GB"
      },
      "areaServed": {
        "@type": "Country",
        "name": "United Kingdom"
      },
      "serviceArea": {
        "@type": "Country",
        "name": "United Kingdom"
      },
      "knowsAbout": [
        "Network Consultancy",
        "Network Design",
        "Network Deployment",
        "Network Installation",
        "Network Support",
        "Managed Network Support",
        "Managed Wireless LAN",
        "Firewall Security",
        "Network Security",
        "Remote Access",
        "VPN",
        "Business Continuity",
        "Cisco Consultancy",
        "IT Infrastructure",
        "Managed Network Services"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Network Consultancy Services",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Network Consultancy" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Network Design & Deployment" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Network Installation" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Network Support" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Managed Network Support" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Managed Wireless LAN" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Firewall & Network Security" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Remote Access & VPN" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Business Continuity" } }
        ]
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://network-consultancy.com/#website",
      "url": "https://network-consultancy.com/",
      "name": "Network Consultancy",
      "description": "Network Consultancy provides professional network consultancy, network design and deployment, network installation, managed network support, managed wireless LAN, firewall and network security, remote access VPN and business continuity solutions.",
      "inLanguage": "en-GB",
      "publisher": {
        "@id": "https://network-consultancy.com/#organization"
      }
    }
  ];

  schemas.forEach(function (schemaObj) {
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaObj);
    document.head.appendChild(script);
  });
})();
