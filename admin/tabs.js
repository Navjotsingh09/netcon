(function () {
  'use strict';

  function setActiveTab(active) {
    const articlesButton = document.getElementById('articles-button');
    const pagesButton = document.getElementById('pages-button');
    const articlesView = document.querySelector('.cms-workspace__body');
    const pagesView = document.getElementById('pages-panel');
    if (!articlesButton || !pagesButton || !articlesView || !pagesView) return;
    const showPages = active === 'pages';
    articlesView.hidden = showPages;
    pagesView.hidden = !showPages;
    articlesButton.classList.toggle('cms-tab--active', !showPages);
    pagesButton.classList.toggle('cms-tab--active', showPages);
  }

  function renderPilotPages() {
    const pagesList = document.getElementById('pages-list');
    if (!pagesList || pagesList.children.length) return;
    pagesList.innerHTML = [
      ['home', 'Home', '/'],
      ['about', 'About Us', '/about'],
      ['contact', 'Contact Us', '/contact']
    ].map(([slug, label, path]) => `<button class="cms-page-card" type="button" data-page-slug="${slug}"><span><strong>${label}</strong><small>${path}</small></span><span class="cms-status">Setup required</span></button>`).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('articles-button')?.addEventListener('click', function () { setActiveTab('articles'); });
    document.getElementById('pages-button')?.addEventListener('click', function () { setActiveTab('pages'); renderPilotPages(); });
  });
}());