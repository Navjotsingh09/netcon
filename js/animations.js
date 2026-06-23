/**
 * animations.js — Net Con shared scroll animation utility
 *
 * Import on every page with zero configuration:
 *   <script src="js/animations.js" defer></script>
 *
 * Automatically activates on any element with:
 *   .animate-fade-up    — fade in + slide up when 20% in viewport
 *   .animate-fade-in    — fade in when 20% in viewport
 *   .stagger-children   — staggers child delays (CSS handles timing)
 *
 * The observer adds .is-visible once, then unobserves.
 * No configuration, no external dependencies, pure vanilla JS.
 */

(function () {
  'use strict';

  // Respect prefers-reduced-motion — skip all JS if user prefers reduced motion.
  // The CSS already hides the transition; skipping JS means elements stay visible
  // without needing .is-visible at all.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Make all animated elements immediately visible
    document.querySelectorAll('.animate-fade-up, .animate-fade-in').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  function createObserver() {
    return new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Fire once then stop watching
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // Trigger when 20% of the element is visible
        threshold: 0.2,
        // Small negative root margin prevents instant firing on elements
        // near the very top of the page on load
        rootMargin: '0px 0px -40px 0px',
      }
    );
  }

  function init() {
    var observer = createObserver();

    // Observe every element with an animation class
    var targets = document.querySelectorAll('.animate-fade-up, .animate-fade-in');
    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Run after the DOM is fully parsed
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
