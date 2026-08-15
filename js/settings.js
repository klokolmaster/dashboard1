/* ================================================================
   SETTINGS.JS — Settings Modal: UI, Config Save, Wallpaper Apply
   ================================================================ */

(function () {

  /* ---- Open / Close ---- */

  function openSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    loadSettingsUI();
  }

  function closeSettings() {
    const overlay = document.getElementById('settings-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  /* ---- Load saved values into the modal UI ---- */

  function loadSettingsUI() {
    const cfg = Config.get();

    // Wallpaper
    const wpType = document.getElementById('cfg-wp-type');
    const wpUrl  = document.getElementById('cfg-wp-url');
    if (wpType) wpType.value = cfg.wallpaper.type || 'none';
    if (wpUrl)  wpUrl.value  = cfg.wallpaper.url  || '';

    // Crypto coins
    const coinsList = document.getElementById('crypto-coins-settings');
    if (coinsList) {
      coinsList.innerHTML = '';
      const coins = cfg.crypto.coins || ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];
      coins.forEach(c => coinsList.appendChild(makeCoinRow(c)));
    }

    // Shortcuts
    const shortcutsList = document.getElementById('shortcuts-settings');
    if (shortcutsList) {
      shortcutsList.innerHTML = '';
      (cfg.shortcuts || []).forEach(s => shortcutsList.appendChild(makeShortcutRow(s)));
    }
  }

  /* ---- Row Builders ---- */

  function makeCoinRow(coin) {
    const row = document.createElement('div');
    row.className = 'settings-item-row';
    row.innerHTML = `
      <input type="text" class="settings-input coin-sym-input"
             value="${escAttr(coin)}"
             placeholder="e.g. BTC"
             maxlength="10"
             style="text-transform:uppercase;">
      <button class="btn-remove" title="Remove">✕</button>`;
    row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
    const inp = row.querySelector('.coin-sym-input');
    inp.addEventListener('input', () => { inp.value = inp.value.toUpperCase(); });
    return row;
  }

  function makeShortcutRow(shortcut) {
    const row = document.createElement('div');
    row.className = 'settings-item-row';
    row.innerHTML = `
      <input type="text" class="settings-input label-input"
             value="${escAttr(shortcut.label || '')}" placeholder="Label">
      <input type="url" class="settings-input"
             value="${escAttr(shortcut.url || '')}" placeholder="https://...">
      <button class="btn-remove" title="Remove">✕</button>`;
    row.querySelector('.btn-remove').addEventListener('click', () => row.remove());
    return row;
  }

  /* ---- Add New Row Buttons ---- */

  function addCoinRow() {
    const coinsList = document.getElementById('crypto-coins-settings');
    if (!coinsList) return;
    if (coinsList.children.length >= 5) {
      showToast('⚠️ Maximum 5 coins allowed');
      return;
    }
    coinsList.appendChild(makeCoinRow(''));
  }

  function addShortcutRow() {
    const shortcutsList = document.getElementById('shortcuts-settings');
    if (shortcutsList) shortcutsList.appendChild(makeShortcutRow({ label: '', url: '' }));
  }

  /* ---- Save ---- */

  function saveSettings() {
    // Wallpaper
    const wpType = document.getElementById('cfg-wp-type').value;
    const wpUrl  = document.getElementById('cfg-wp-url').value.trim();

    // Coins
    const coinInputs = document.querySelectorAll('.coin-sym-input');
    const coins = Array.from(coinInputs)
      .map(i => i.value.trim().toUpperCase())
      .filter(c => c.length > 0 && c.length <= 12)
      .slice(0, 5);

    // Shortcuts
    const shortcutRows = document.querySelectorAll('#shortcuts-settings .settings-item-row');
    const shortcuts = Array.from(shortcutRows).map(row => ({
      label: row.querySelector('.label-input').value.trim(),
      url:   row.querySelectorAll('input')[1].value.trim()
    })).filter(s => s.label && s.url);

    // Persist
    Config.update({
      wallpaper:  { type: wpType, url: wpUrl },
      crypto:     { coins: coins.length > 0 ? coins : ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'] },
      shortcuts
    });

    // Apply wallpaper immediately
    applyWallpaper({ type: wpType, url: wpUrl });

    // Re-init home page so crypto list reflects new coins
    const homePage = document.getElementById('page-home');
    if (homePage && homePage.classList.contains('active')) {
      if (typeof initHomePage === 'function') initHomePage();
    }

    closeSettings();
    showToast('✅ Settings saved!');
  }

  /* ---- Toast Utility ---- */

  window.showToast = function (msg) {
    let toast = document.getElementById('toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-msg';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
  };

  /* ---- Utilities ---- */

  function escAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ---- Init ---- */

  function initSettings() {
    // Bind settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);

    // Close button
    const closeBtn = document.getElementById('settings-close');
    if (closeBtn) closeBtn.addEventListener('click', closeSettings);

    // Cancel button
    const cancelBtn = document.getElementById('settings-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', closeSettings);

    // Save button
    const saveBtn = document.getElementById('settings-save');
    if (saveBtn) saveBtn.addEventListener('click', saveSettings);

    // Add coin
    const addCoinBtn = document.getElementById('add-coin-btn');
    if (addCoinBtn) addCoinBtn.addEventListener('click', addCoinRow);

    // Add shortcut
    const addShortcutBtn = document.getElementById('add-shortcut-btn');
    if (addShortcutBtn) addShortcutBtn.addEventListener('click', addShortcutRow);

    // Preview wallpaper
    const previewBtn = document.getElementById('wp-preview-btn');
    if (previewBtn) previewBtn.addEventListener('click', previewWallpaper);

    // Close on overlay click (outside modal)
    const overlay = document.getElementById('settings-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeSettings();
      });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const overlay = document.getElementById('settings-overlay');
        if (overlay && overlay.style.display !== 'none') closeSettings();
      }
    });
  }

  window.initSettings = initSettings;

})();
