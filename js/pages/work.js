/* ================================================================
   WORK.JS — Work Page: TradingView Widget + Fear & Greed Index
   ================================================================ */

(function () {

  let tvInitialized = false;

  /* ========================================================
     TradingView Advanced Chart Widget
     ======================================================== */

  function initTradingView() {
    if (tvInitialized) return;
    tvInitialized = true;

    const container = document.getElementById('tradingview-widget');
    if (!container) return;

    // Load TradingView library dynamically
    const script = document.createElement('script');
    script.src   = 'https://s3.tradingview.com/tv.js';
    script.async = true;

    script.onload = function () {
      try {
        new TradingView.widget({
          container_id:      'tradingview-widget',
          symbol:            'BYBIT:BTCUSDT',
          interval:          '60',
          theme:             'dark',
          style:             '1',           // Candlestick
          locale:            'en',
          toolbar_bg:        '#0d1421',
          enable_publishing: false,
          allow_symbol_change: true,
          save_image:        false,
          hide_side_toolbar: false,
          withdateranges:    true,
          width:             '100%',
          height:            '100%',
          autosize:          true,
          studies: [
            'Volume@tv-basicstudies'
          ]
        });
      } catch (e) {
        console.warn('[TradingView] Widget init failed:', e);
        showTVFallback(container);
      }
    };

    script.onerror = function () {
      console.warn('[TradingView] Script failed to load');
      showTVFallback(container);
    };

    document.head.appendChild(script);
  }

  function showTVFallback(container) {
    container.innerHTML = `
      <div class="iframe-blocked-card">
        <div class="blocked-app-icon">📈</div>
        <div class="blocked-app-name">TradingView</div>
        <div class="blocked-app-desc">Widget failed to load.<br>Click below to open in full screen.</div>
        <a href="https://www.tradingview.com/chart/?symbol=BYBIT:BTCUSDT" target="_blank" rel="noopener"
           class="launch-btn-full" style="background:linear-gradient(135deg,#1e3a5f,#2563eb);">
          Open TradingView ↗
        </a>
      </div>`;
  }

  /* ========================================================
     Fear & Greed Index (alternative.me API — free, CORS OK)
     ======================================================== */

  async function fetchFearGreed() {
    const container = document.getElementById('fng-container');
    if (!container) return;

    try {
      const res  = await fetch('https://api.alternative.me/fng/?limit=1', {
        signal: AbortSignal.timeout(8000)
      });
      const data = await res.json();
      const fng  = data.data[0];

      const value = parseInt(fng.value, 10);
      const label = fng.value_classification;
      const ts    = fng.timestamp;

      // Color based on value
      let color, trackColor;
      if      (value >= 75) { color = '#22c55e'; trackColor = 'rgba(34,197,94,0.15)'; }
      else if (value >= 55) { color = '#86efac'; trackColor = 'rgba(134,239,172,0.15)'; }
      else if (value >= 46) { color = '#facc15'; trackColor = 'rgba(250,204,21,0.15)'; }
      else if (value >= 26) { color = '#fb923c'; trackColor = 'rgba(251,146,60,0.15)'; }
      else                  { color = '#ef4444'; trackColor = 'rgba(239,68,68,0.15)'; }

      // SVG gauge (full circle, value as arc from top)
      const R          = 44;
      const CIRC       = 2 * Math.PI * R;
      const filled     = (value / 100) * CIRC;

      const updatedDate = ts
        ? new Date(parseInt(ts) * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : '';

      container.innerHTML = `
        <div class="fng-gauge-wrapper">
          <svg class="fng-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Track -->
            <circle cx="50" cy="50" r="${R}" fill="none"
              stroke="rgba(255,255,255,0.07)" stroke-width="9"/>
            <!-- Value arc -->
            <circle cx="50" cy="50" r="${R}" fill="none"
              stroke="${color}" stroke-width="9"
              stroke-dasharray="${filled.toFixed(2)} ${CIRC.toFixed(2)}"
              stroke-linecap="round"
              transform="rotate(-90 50 50)"
              style="filter:drop-shadow(0 0 6px ${color})"/>
            <!-- Value text -->
            <text x="50" y="46" text-anchor="middle"
              fill="white" font-family="Inter,sans-serif"
              font-size="22" font-weight="800" dominant-baseline="middle">${value}</text>
            <text x="50" y="64" text-anchor="middle"
              fill="rgba(255,255,255,0.5)" font-family="Inter,sans-serif"
              font-size="7" font-weight="600" letter-spacing="0.5">${label.toUpperCase()}</text>
          </svg>
        </div>
        <div class="fng-label" style="color:${color}">${label}</div>
        <div class="fng-sublabel">Crypto Fear &amp; Greed${updatedDate ? ' · ' + updatedDate : ''}</div>`;

    } catch (e) {
      console.warn('[FearGreed] Fetch failed:', e);
      const container2 = document.getElementById('fng-container');
      if (container2) {
        container2.innerHTML = `
          <div class="error-state">
            <div class="error-icon">😨</div>
            <div>Index unavailable</div>
            <a href="https://alternative.me/crypto/fear-and-greed-index/" target="_blank" rel="noopener">View online ↗</a>
          </div>`;
      }
    }
  }

  /* ========================================================
     INIT
     ======================================================== */

  function initWorkPage() {
    initTradingView();
    fetchFearGreed();

    // Refresh Fear & Greed every 5 minutes
    setInterval(fetchFearGreed, 5 * 60_000);
  }

  window.initWorkPage = initWorkPage;

})();
