(function () {
  'use strict';

  var main = document.getElementById('main');
  var overview = main && main.querySelector('.svl-overview');
  if (!main || !overview) return;

  var pressureSection = main.querySelector('.sd-section');
  var whySection = main.querySelector('.fin-why');

  if (!pressureSection) pressureSection = main.querySelector('[aria-labelledby="support-h"]');

  if (!whySection) {
    var banners = Array.prototype.slice.call(main.querySelectorAll('.industry-banner'));
    whySection = banners.find(function (section) {
      var eyebrow = section.querySelector('.industry-banner__eyebrow');
      var title = section.querySelector('.industry-banner__title');
      return (eyebrow && eyebrow.textContent.trim() === 'Why Choose Us') ||
        (title && title.textContent.trim() === 'Why Choose Us?');
    });
  }

  if (!whySection) whySection = main.querySelector('.hc-banner');

  if (pressureSection) main.insertBefore(pressureSection, overview);
  if (whySection) main.insertBefore(whySection, overview);
})();
