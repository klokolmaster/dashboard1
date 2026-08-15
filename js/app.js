/* ================================================================
   APP.JS — Main Application: Router & Init
   All other JS files must be loaded before this one.
   ================================================================ */

(function () {

  const VALID_PAGES   = ['home', 'work', 'notes', 'calendar'];
  const pageInited    = {};   // track which pages have been initialised

  /* ========================================================
     Router — show/hide page sections, update nav
     ======================================================== */

  function navigateTo(page) {
    if (!VALID_PAGES.includes(page)) page = 'home';

    // Deactivate all pages
    document.querySelectorAll('.page-section').forEach(el => {
      el.classList.remove('active');
    });

    // Deactivate all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Activate target page
    const pageEl = document.getElementById('page-' + page);
    if (pageEl) pageEl.classList.add('active');

    // Activate matching nav button
    const navBtn = document.getElementById('nav-' + page);
    if (navBtn) navBtn.classList.add('active');

    // Update URL hash (for back/forward + sharing)
    history.replaceState(null, '', '#' + page);

    // Lazy-init page on first visit
    if (!pageInited[page]) {
      pageInited[page] = true;
      lazyInitPage(page);
    } else if (page === 'notes') {
      // Re-render notes grid on every revisit (lightweight, no listener re-bind)
      const grid = document.getElementById('notes-grid');
      if (grid && typeof initNotesPage === 'function') initNotesPage();
    }
  }

  function lazyInitPage(page) {
    switch (page) {
      case 'home':
        if (typeof initHomePage     === 'function') initHomePage();
        break;
      case 'work':
        if (typeof initWorkPage     === 'function') initWorkPage();
        break;
      case 'notes':
        if (typeof initNotesPage    === 'function') initNotesPage();
        break;
      case 'calendar':
        if (typeof initCalendarPage === 'function') initCalendarPage();
        break;
    }
  }

  /* ========================================================
     Nav Button Clicks
     ======================================================== */

  function bindNavButtons() {
    document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.page));
    });
  }

  /* ========================================================
     Hash-based routing
     ======================================================== */

  function getInitialPage() {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    return VALID_PAGES.includes(hash) ? hash : 'home';
  }

  window.addEventListener('hashchange', () => {
    const page = window.location.hash.replace('#', '').toLowerCase();
    if (VALID_PAGES.includes(page)) {
      // Only navigate if different from current
      const current = document.querySelector('.nav-btn.active');
      if (!current || current.dataset.page !== page) {
        navigateTo(page);
      }
    }
  });

  /* ========================================================
     Boot
     ======================================================== */

  function boot() {
    // 1. Clock (runs every second — no page dependency)
    if (typeof initClock    === 'function') initClock();

    // 2. Search bar
    if (typeof initSearch   === 'function') initSearch();

    // 3. Wallpaper from saved config
    if (typeof initWallpaper === 'function') initWallpaper();

    // 4. Settings modal
    if (typeof initSettings === 'function') initSettings();

    // 5. Bind nav buttons
    bindNavButtons();

    // 6. Navigate to initial page (from URL hash or default: home)
    navigateTo(getInitialPage());

    console.log('[Dashboard] Booted ✅');
  }

  /* Expose for programmatic navigation (e.g., from tests or other scripts) */
  window.navigateTo = navigateTo;

  /* Start when DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
