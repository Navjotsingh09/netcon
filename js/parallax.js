/**
 * parallax.js — Stacked card parallax peel for .parallax-cards-wrapper
 *
 * Uses the same viewport-progress formula as the scroll-banner parallax:
 *   progress = 0  → wrapper bottom just enters viewport (section arriving)
 *   progress = 1  → wrapper top just exits viewport   (section leaving)
 *
 * Card 1 travels farther (max1 px) than Card 2 (max2 px), creating a
 * peel/reveal effect.  The 100px CSS overlap fully resolves at ~progress 0.6.
 *
 * Breakpoints:
 *   Desktop  (≥1440px): max1=220, max2=80   → differential 140px
 *   Tablet  (768-1439): max1=100, max2=40   → differential  60px
 *   Mobile    (<768px): disabled            → static CSS overlap only
 */

(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var wrapper = document.querySelector('.parallax-cards-wrapper');
  if (!wrapper) return;

  var card1 = wrapper.querySelector('.scroll-banner-wrap:first-child');
  var card2 = wrapper.querySelector('.scroll-banner-wrap:last-child');
  if (!card1 || !card2) return;

  var ticking = false;

  function getMaxShifts() {
    var w = window.innerWidth;
    if (w < 768)  return null;
    if (w < 1440) return { max1: 100, max2: 40 };
    return          { max1: 220, max2: 80 };
  }

  function applyParallax() {
    var shifts = getMaxShifts();

    if (!shifts) {
      card1.style.transform = '';
      card2.style.transform = '';
      ticking = false;
      return;
    }

    var wRect  = wrapper.getBoundingClientRect();
    var vpH    = window.innerHeight;

    /* Skip when completely off-screen */
    if (wRect.bottom < 0 || wRect.top > vpH) {
      ticking = false;
      return;
    }

    /* progress: 0 when section enters from bottom, 1 when section exits at top */
    var progress = (vpH - wRect.top) / (vpH + wRect.height);
    progress = Math.max(0, Math.min(1, progress));

    /* Card 1 accelerates upward (peels away) */
    card1.style.transform = 'translateY(' + (-progress * shifts.max1).toFixed(1) + 'px)';
    /* Card 2 rises more slowly (revealed from beneath) */
    card2.style.transform = 'translateY(' + (-progress * shifts.max2).toFixed(1) + 'px)';

    ticking = false;
  }

  /* Always-on scroll listener — applyParallax returns early when off-screen */
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    requestAnimationFrame(applyParallax);
  });

  /* Set initial positions on page load */
  applyParallax();

}());

/**
 * Stacked-deck parallax for .nd-figma-stack cards (home page).
 *
 * CSS pins each .nd-figma-card with position:sticky (staggered top offsets).
 * As the next card scrolls up and covers a pinned card, this script scales
 * the pinned card back (1 → 0.94) and dims it slightly, creating depth.
 *
 * progress per card: 0 when the covering element's top is at the pinned
 * card's bottom edge, 1 when it reaches the 18px peek strip.
 * Disabled below 769px (cards are static there) and for reduced motion.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var stack = document.querySelector('.nd-figma-stack');
  if (!stack) return;

  var cards = Array.prototype.slice.call(stack.querySelectorAll('.nd-figma-card'));
  if (!cards.length) return;

  /* Each card is covered by its next sibling (card or managed banner) */
  var pairs = cards
    .map(function (card) {
      return { card: card, next: card.nextElementSibling };
    })
    .filter(function (p) { return p.next; });

  var MAX_SCALE_DROP = 0.06;
  var MAX_DIM = 0.25;
  var PEEK = 18;
  var ticking = false;

  function applyDeck() {
    if (window.innerWidth < 769) {
      pairs.forEach(function (p) {
        p.card.style.transform = '';
        p.card.style.opacity = '';
      });
      ticking = false;
      return;
    }

    var vpH = window.innerHeight;

    pairs.forEach(function (p) {
      var cardRect = p.card.getBoundingClientRect();
      var nextTop = p.next.getBoundingClientRect().top;
      var height = p.card.offsetHeight; /* layout height, unaffected by scale */

      /* Skip work when the pair is far off-screen */
      if (cardRect.top > vpH || nextTop < -height) return;

      var range = height - PEEK;
      var progress = (cardRect.top + height - nextTop) / range;
      progress = Math.max(0, Math.min(1, progress));

      if (progress === 0) {
        p.card.style.transform = '';
        p.card.style.opacity = '';
      } else {
        p.card.style.transform = 'scale(' + (1 - progress * MAX_SCALE_DROP).toFixed(4) + ')';
        p.card.style.opacity = (1 - progress * MAX_DIM).toFixed(3);
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(applyDeck);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', function () {
    requestAnimationFrame(applyDeck);
  });

  applyDeck();
}());
