// ===== SITEWIDE SCHEMA MARKUP =====
// Injects Organization, ProfessionalService, WebSite,
// Review and dynamic FAQPage JSON-LD schema.

(function () {
  'use strict';

  // =============================================================
  // SITEWIDE SCHEMA
  // =============================================================

  var schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
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
          "addressRegion": "West Midlands",
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
          "https://twitter.com/NetConSupport"
        ]
      },

      {
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
          "addressRegion": "West Midlands",
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
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Network Consultancy"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Network Design & Deployment"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Network Installation"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Network Support"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Managed Network Support"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Managed Wireless LAN"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Firewall & Network Security"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Remote Access & VPN"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Business Continuity"
              }
            }
          ]
        },

        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.4",
          "bestRating": "5",
          "ratingCount": "4"
        }
      },

      {
        "@type": "WebSite",
        "@id": "https://network-consultancy.com/#website",
        "url": "https://network-consultancy.com/",
        "name": "Network Consultancy",
        "description": "Network Consultancy provides professional network consultancy, network design and deployment, network installation, managed network support, managed wireless LAN, firewall and network security, remote access VPN and business continuity solutions.",
        "inLanguage": "en-GB",
        "publisher": {
          "@id": "https://network-consultancy.com/#organization"
        }
      },

      {
        "@type": "Review",
        "@id": "https://network-consultancy.com/#review-faye-adams",
        "itemReviewed": {
          "@id": "https://network-consultancy.com/#localbusiness"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "name": "Great services provided in managing network and security of IT infrastructure.",
        "author": {
          "@type": "Person",
          "name": "Faye Adams"
        }
      }
    ]
  };


  // =============================================================
  // FUNCTION: INJECT JSON-LD
  // =============================================================

  function injectSchema(data, id) {

    // Prevent duplicate schema
    if (document.getElementById(id)) {
      return;
    }

    var script = document.createElement('script');

    script.type = 'application/ld+json';
    script.id = id;

    script.textContent = JSON.stringify(data);

    document.head.appendChild(script);
  }


  // =============================================================
  // INJECT SITEWIDE SCHEMA
  // =============================================================

  injectSchema(
    schema,
    'network-sitewide-schema'
  );


  // =============================================================
  // DYNAMIC FAQ SCHEMA
  // =============================================================

  function buildFAQSchema() {

    var faqContainer = document.getElementById(
      'nd-faq-list'
    );

    if (!faqContainer) {
      return null;
    }


    var faqButtons = faqContainer.querySelectorAll(
      '.nd-faq__item'
    );

    if (!faqButtons.length) {
      return null;
    }


    var mainEntity = [];


    faqButtons.forEach(function (button) {

      // QUESTION
      var questionElement = button.querySelector(
        'span'
      );


      // ANSWER
      var answerElement = button.nextElementSibling;


      // Validate structure
      if (!questionElement) {
        return;
      }

      if (!answerElement) {
        return;
      }

      if (
        !answerElement.classList.contains(
          'nd-faq__panel'
        )
      ) {
        return;
      }


      // Get clean text
      var question = questionElement.textContent
        .replace(/\s+/g, ' ')
        .trim();

      var answer = answerElement.textContent
        .replace(/\s+/g, ' ')
        .trim();


      if (!question || !answer) {
        return;
      }


      mainEntity.push({
        "@type": "Question",
        "name": question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": answer
        }
      });

    });


    if (!mainEntity.length) {
      return null;
    }


    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": window.location.origin +
        window.location.pathname +
        "#faq",
      "url": window.location.origin +
        window.location.pathname,
      "mainEntity": mainEntity
    };

  }


  // =============================================================
  // ADD FAQ SCHEMA
  // =============================================================

  function injectFAQ() {

    var faqSchema = buildFAQSchema();

    if (!faqSchema) {
      return false;
    }

    // Remove previous version if it exists
    var oldFAQ = document.getElementById(
      'network-faq-schema'
    );

    if (oldFAQ) {
      oldFAQ.remove();
    }


    injectSchema(
      faqSchema,
      'network-faq-schema'
    );


    console.log(
      'FAQ Schema successfully generated:',
      faqSchema
    );

    return true;
  }


  // =============================================================
  // START
  // =============================================================

  function start() {

    // Try immediately
    if (injectFAQ()) {
      return;
    }


    // Watch for FAQ generated later
    var observer = new MutationObserver(
      function () {

        if (injectFAQ()) {
          observer.disconnect();
        }

      }
    );


    observer.observe(
      document.body,
      {
        childList: true,
        subtree: true
      }
    );


    // Stop after 15 seconds
    setTimeout(
      function () {
        observer.disconnect();
      },
      15000
    );

  }


  // =============================================================
  // DOM READY
  // =============================================================

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      start
    );

  } else {

    start();

  }

})();

// ============================================================
// BLOGPOSTING SCHEMA - DYNAMIC DATE FROM HTML
// ============================================================

// ============================================================
// DYNAMIC BLOGPOSTING SCHEMA
// Network Consultancy
// ============================================================

(function () {

  function createBlogPostingSchema() {

    // ==========================================================
    // CURRENT PAGE URL
    // ==========================================================

    const pageUrl =
      window.location.origin + window.location.pathname;


    // ==========================================================
    // HEADLINE
    // Gets the blog title from H1
    // ==========================================================

    const headlineElement = document.querySelector('h1');

    const headline = headlineElement
      ? headlineElement.textContent.trim()
      : document.title.trim();


    // ==========================================================
    // DESCRIPTION
    // Gets description from meta description
    // ==========================================================

    const descriptionElement = document.querySelector(
      'meta[name="description"]'
    );

    const description = descriptionElement
      ? descriptionElement.getAttribute('content').trim()
      : '';


    // ==========================================================
    // IMAGE
    // First tries og:image
    // ==========================================================

    const ogImageElement = document.querySelector(
      'meta[property="og:image"]'
    );

    let image = ogImageElement
      ? ogImageElement.getAttribute('content')
      : '';


    // ==========================================================
    // FALLBACK IMAGE
    // If og:image does not exist, use first blog image
    // ==========================================================

    if (!image) {

      const blogImage = document.querySelector(
        '.blog-main img'
      );

      if (blogImage) {
        image = blogImage.src;
      }

    }


    // ==========================================================
    // BLOG DATE
    //
    // HTML:
    //
    // <p class="blog-main__meta">
    //   <span>21/07/2026</span>
    //   <span>Category: Infrastructure</span>
    // </p>
    //
    // Converts:
    // 21/07/2026
    //
    // Into:
    // 2026-07-21
    // ==========================================================

    const dateElement = document.querySelector(
      '.blog-main__meta span:first-child'
    );

    let blogDate = '';

    if (dateElement) {

      const dateText = dateElement.textContent.trim();

      const dateParts = dateText.split('/');

      if (dateParts.length === 3) {

        const day = dateParts[0].padStart(2, '0');

        const month = dateParts[1].padStart(2, '0');

        const year = dateParts[2].trim();

        blogDate = `${year}-${month}-${day}`;

      }

    }


    // ==========================================================
    // BLOG CATEGORY
    //
    // HTML:
    //
    // <span>Category: Infrastructure</span>
    //
    // Converts to:
    //
    // "Infrastructure"
    // ==========================================================

    const categoryElement = document.querySelector(
      '.blog-main__meta span:nth-child(2)'
    );

    let category = '';

    if (categoryElement) {

      const categoryText =
        categoryElement.textContent.trim();

      category = categoryText
        .replace(/^Category:\s*/i, '')
        .trim();

    }


    // ==========================================================
    // DEBUG
    // ==========================================================

    console.log('==============================');

    console.log('BLOGPOSTING SCHEMA');

    console.log('==============================');

    console.log('URL:', pageUrl);

    console.log('Headline:', headline);

    console.log('Description:', description);

    console.log('Image:', image);

    console.log('Blog Date:', blogDate);

    console.log('Category:', category);


    // ==========================================================
    // BLOGPOSTING SCHEMA
    // ==========================================================

    const blogSchema = {

      "@context": "https://schema.org",

      "@type": "BlogPosting",

      "mainEntityOfPage": {

        "@type": "WebPage",

        "@id": pageUrl

      },

      "headline": headline,

      "description": description,

      "image": image,

      "author": {

        "@type": "Organization",

        "name": "Network Consultancy",

        "url": "https://network-consultancy.com/"

      },

      "publisher": {

        "@type": "Organization",

        "name": "Network Consultancy",

        "logo": {

          "@type": "ImageObject",

          "url":
            "https://network-consultancy.com/images/misc/logo.png"

        }

      },

      "datePublished": blogDate,

      "dateModified": blogDate,

      "Category": category

    };


    // ==========================================================
    // REMOVE EXISTING DYNAMIC BLOGPOSTING SCHEMA
    // ==========================================================

    const existingSchemas = document.querySelectorAll(
      'script[data-dynamic-blog-schema="true"]'
    );

    existingSchemas.forEach(function (schema) {
      schema.remove();
    });


    // ==========================================================
    // CREATE JSON-LD SCRIPT
    // ==========================================================

    const schemaScript =
      document.createElement('script');

    schemaScript.type = 'application/ld+json';

    schemaScript.setAttribute(
      'data-dynamic-blog-schema',
      'true'
    );

    schemaScript.textContent = JSON.stringify(
      blogSchema,
      null,
      2
    );


    // ==========================================================
    // ADD SCHEMA TO <HEAD>
    // ==========================================================

    document.head.appendChild(schemaScript);


    // ==========================================================
    // SHOW FINAL SCHEMA IN CONSOLE
    // ==========================================================

    console.log(
      'Final BlogPosting JSON-LD:',
      JSON.stringify(
        blogSchema,
        null,
        2
      )
    );

  }


  // ==========================================================
  // RUN AFTER PAGE LOAD
  // ==========================================================

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      createBlogPostingSchema
    );

  } else {

    createBlogPostingSchema();

  }

})();
(function () {

  function createFAQSchema() {

    // Find the FAQ container
    const faqContainer = document.querySelector('.nd-faq__right');

    if (!faqContainer) {
      console.log('FAQ container not found.');
      return;
    }

    // Find all FAQ question buttons
    const questions = faqContainer.querySelectorAll('.nd-faq__item');

    const mainEntity = [];

    questions.forEach(function (questionButton) {

      // Get question text
      const questionElement = questionButton.querySelector('span');

      if (!questionElement) {
        return;
      }

      const question = questionElement.textContent
        .replace(/\s+/g, ' ')
        .trim();


      // The answer is the next element after the button
      const answerElement = questionButton.nextElementSibling;

      if (
        !answerElement ||
        !answerElement.classList.contains('nd-faq__panel')
      ) {
        return;
      }


      // Get answer text
      const answer = answerElement.textContent
        .replace(/\s+/g, ' ')
        .trim();


      // Only add complete FAQ pairs
      if (!question || !answer) {
        return;
      }


      // Add FAQ to schema
      mainEntity.push({
        "@type": "Question",
        "name": question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": answer
        }
      });

    });


    // Stop if no FAQs found
    if (!mainEntity.length) {
      console.log('No FAQ questions/answers found.');
      return;
    }


    // Create FAQPage schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": mainEntity
    };


    // Remove previously generated FAQ schema
    const oldSchema = document.querySelector(
      'script[data-dynamic-faq-schema="true"]'
    );

    if (oldSchema) {
      oldSchema.remove();
    }


    // Create JSON-LD script
    const schemaScript = document.createElement('script');

    schemaScript.type = 'application/ld+json';

    schemaScript.setAttribute(
      'data-dynamic-faq-schema',
      'true'
    );

    schemaScript.textContent = JSON.stringify(
      faqSchema,
      null,
      2
    );


    // Add schema to <head>
    document.head.appendChild(schemaScript);


    // Console confirmation
    console.log('==============================');
    console.log('DYNAMIC FAQ SCHEMA CREATED');
    console.log('==============================');
    console.log('FAQ count:', mainEntity.length);
    console.log(
      JSON.stringify(faqSchema, null, 2)
    );

  }


  // Run after HTML is loaded
  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      createFAQSchema
    );

  } else {

    createFAQSchema();

  }

})();