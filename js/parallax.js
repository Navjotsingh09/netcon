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
