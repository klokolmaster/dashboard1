/* ================================================================
   SEARCH.JS — Google Search Handler
   ================================================================ */

(function () {
  function initSearch() {
    const form  = document.getElementById('search-form');
    const input = document.getElementById('search-input');

    if (!form || !input) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      const url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
      window.open(url, '_blank', 'noopener,noreferrer');
      input.value = '';
    });

    // Optional: keyboard shortcut — press "/" to focus search
    document.addEventListener('keydown', function (e) {
      // Don't steal focus if user is typing in a contenteditable
      const active = document.activeElement;
      const isEditing =
        active &&
        (active.isContentEditable ||
          active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT');

      if (e.key === '/' && !isEditing) {
        e.preventDefault();
        input.focus();
        input.select();
      }

      // Escape to blur
      if (e.key === 'Escape' && document.activeElement === input) {
        input.blur();
      }
    });
  }

  window.initSearch = initSearch;
})();
