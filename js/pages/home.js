/* ================================================================
   HOME.JS — Home Page: USD/IDR Forex, Crypto Prices, Econ Calendar
   ================================================================ */

(function () {

  /* ---- Coin ID mapping: ticker → CoinGecko ID ---- */
  const COINGECKO_IDS = {
    BTC:   'bitcoin',
    ETH:   'ethereum',
    SOL:   'solana',
    BNB:   'binancecoin',
    XRP:   'ripple',
    ADA:   'cardano',
    DOGE:  'dogecoin',
    AVAX:  'avalanche-2',
    DOT:   'polkadot',
    LINK:  'chainlink',
    UNI:   'uniswap',
    MATIC: 'matic-network',
    LTC:   'litecoin',
    ATOM:  'cosmos',
    FIL:   'filecoin'
  };

  /* ---- Bybit TradingView symbol ---- */
  function bybitTVSymbol(ticker) {
    return `BYBIT:${ticker}USDT`;
  }

  /* ========================================================
     1. USD → IDR FOREX
     ======================================================== */

  async function fetchForex() {
    const endpoints = [
      'https://open.er-api.com/v6/latest/USD',
      'https://api.frankfurter.app/latest?from=USD&to=IDR'
    ];

    for (const url of endpoints) {
      try {
        const res  = await fetch(url, { signal: AbortSignal.timeout(6000) });
        const data = await res.json();

        // open.er-api.com
        if (data.rates && data.rates.IDR) {
          return { rate: data.rates.IDR, source: 'open.er-api.com', success: true };
        }
        // frankfurter.app
        if (data.rates && data.rates.IDR) {
          return { rate: data.rates.IDR, source: 'frankfurter.app', success: true };
        }
      } catch (_) { /* try next */ }
    }
    return { success: false };
  }

  function renderForex(result) {
    const card = document.getElementById('forex-card');
    if (!card) return;

    if (!result.success) {
      card.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <div>Exchange rate unavailable</div>
          <a href="https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=IDR" target="_blank" rel="noopener">View on XE ↗</a>
        </div>`;
      return;
    }

    const formatted = new Intl.NumberFormat('id-ID', {
      maximumFractionDigits: 0
    }).format(Math.round(result.rate));

    card.innerHTML = `
      <div class="forex-content">
        <div class="forex-flag-pair">
          <span class="forex-flag">🇺🇸</span>
          <span class="forex-flag">→</span>
          <span class="forex-flag">🇮🇩</span>
          <span class="forex-pair-label">USD / IDR</span>
        </div>
        <div class="forex-rate-main">${formatted}</div>
        <div class="forex-rate-sub">1 US Dollar</div>
        <div class="forex-source">via ${result.source} · live</div>
      </div>`;
  }

  /* ========================================================
     2. CRYPTO PRICES (CoinGecko — free, no key)
     ======================================================== */

  async function fetchCrypto() {
    const coins = (Config.get('crypto').coins || ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'])
      .slice(0, 5);

    const ids = coins
      .map(c => COINGECKO_IDS[c.toUpperCase()] || c.toLowerCase())
      .join(',');

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&precision=4`;

    try {
      const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
      const data = await res.json();
      return { success: true, data, coins };
    } catch (e) {
      console.warn('[Crypto] Fetch failed:', e);
      return { success: false, coins };
    }
  }

  function formatPrice(price) {
    if (price === null || price === undefined) return 'N/A';
    if (price >= 10000) return '$' + new Intl.NumberFormat('en-US').format(Math.round(price));
    if (price >= 1)     return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 0.01)  return '$' + price.toFixed(4);
    return '$' + price.toFixed(6);
  }

  function renderCrypto(result) {
    const container = document.getElementById('crypto-list');
    if (!container) return;

    if (!result.success) {
      container.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <div>Prices unavailable</div>
          <a href="https://www.coingecko.com" target="_blank" rel="noopener">View on CoinGecko ↗</a>
        </div>`;
      return;
    }

    const { data, coins } = result;
    let html = '';

    coins.forEach(ticker => {
      const id     = COINGECKO_IDS[ticker.toUpperCase()] || ticker.toLowerCase();
      const info   = data[id];
      if (!info) return;

      const price  = info.usd;
      const change = info.usd_24h_change || 0;
      const isUp   = change >= 0;
      const sign   = isUp ? '+' : '';
      const cls    = isUp ? 'positive' : 'negative';
      const tvURL  = `https://www.tradingview.com/chart/?symbol=${bybitTVSymbol(ticker.toUpperCase())}`;

      html += `
        <a href="${tvURL}" target="_blank" rel="noopener" class="crypto-row" title="Open ${ticker} on TradingView (Bybit)">
          <div class="crypto-row-left">
            <div class="crypto-coin-symbol">${ticker.toUpperCase()}</div>
            <div class="crypto-coin-name">${id.replace(/-/g, ' ')}</div>
          </div>
          <div class="crypto-row-right">
            <div class="crypto-price">${formatPrice(price)}</div>
            <div class="crypto-change ${cls}">${sign}${change.toFixed(2)}%</div>
          </div>
        </a>`;
    });

    container.innerHTML = html || `<div class="error-state"><div>No data available</div></div>`;
  }

  /* ========================================================
     3. ECONOMIC CALENDAR (Forex Factory / CORS proxy)
     ======================================================== */

  const FF_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
  const CORS_PROXIES = [
    (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`
  ];

  async function fetchEconCalendar() {
    // Try direct first, then proxies
    const urls = [
      FF_URL,
      ...CORS_PROXIES.map(fn => fn(FF_URL))
    ];

    for (const url of urls) {
      try {
        const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
        let   data = await res.json();

        // allorigins wraps in { contents: "..." }
        if (data && data.contents) {
          data = JSON.parse(data.contents);
        }

        if (Array.isArray(data)) return data;
      } catch (_) { /* try next */ }
    }
    return null;
  }

  /* Convert Forex Factory Eastern Time string to WIB
     FF times are in US Eastern (ET): EDT=UTC-4, EST=UTC-5
     WIB = UTC+7 → WIB = ET + 11h (summer/EDT) or +12h (winter/EST)
     We use a fixed +11h approximation (good enough for display). */
  function etToWIB(timeStr) {
    if (!timeStr || timeStr === 'All Day' || timeStr === '') return 'All Day';
    try {
      // timeStr like "8:30am" or "2:00pm"
      const match = timeStr.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
      if (!match) return timeStr;

      let [, h, m, meridiem] = match;
      h = parseInt(h, 10);
      m = parseInt(m, 10);

      if (meridiem.toLowerCase() === 'pm' && h !== 12) h += 12;
      if (meridiem.toLowerCase() === 'am' && h === 12) h  = 0;

      // Add 11 hours for EDT → WIB
      const wibH = (h + 11) % 24;
      return `${String(wibH).padStart(2, '0')}:${String(m).padStart(2, '0')} WIB`;
    } catch (_) { return timeStr; }
  }

  function renderEconCalendar(events) {
    const container = document.getElementById('econ-list');
    if (!container) return;

    if (!events) {
      container.innerHTML = `
        <div class="error-state">
          <div class="error-icon">📅</div>
          <div>Calendar unavailable</div>
          <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener">View on ForexFactory ↗</a>
        </div>`;
      return;
    }

    // Filter: USD + High impact
    const highImpact = events.filter(e =>
      e.country === 'USD' && e.impact === 'High'
    );

    if (highImpact.length === 0) {
      container.innerHTML = `
        <div class="error-state">
          <div class="error-icon">✅</div>
          <div>No high-impact USD events this week</div>
        </div>`;
      return;
    }

    // Group by date
    const byDate = {};
    highImpact.forEach(ev => {
      const key = ev.date ? ev.date.split('T')[0] : 'Unknown';
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(ev);
    });

    const dayShort   = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    let html = '';

    Object.keys(byDate).sort().forEach(dateKey => {
      const evs = byDate[dateKey];
      let dateLabel = dateKey;
      try {
        const d = new Date(dateKey + 'T12:00:00Z');
        dateLabel = `${dayShort[d.getUTCDay()]}, ${d.getUTCDate()} ${monthShort[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      } catch (_) {}

      html += `<div class="econ-date-group">
        <div class="econ-date-label">${dateLabel}</div>`;

      evs.forEach(ev => {
        const time     = etToWIB(ev.time || '');
        const name     = ev.title || 'Unknown Event';
        const actual   = ev.actual   || '';
        const forecast = ev.forecast || '-';
        const previous = ev.previous || '-';
        const hasActual = actual && actual.trim() !== '';

        html += `
          <div class="econ-event">
            <div class="econ-event-time">${time}</div>
            <div class="econ-event-info">
              <div class="econ-event-name">${escapeHtml(name)}</div>
              <div class="econ-event-data">
                ${hasActual ? `<span class="econ-actual">A: ${escapeHtml(actual)}</span>` : ''}
                <span class="econ-forecast">F: ${escapeHtml(forecast)}</span>
                <span class="econ-previous">P: ${escapeHtml(previous)}</span>
              </div>
            </div>
          </div>`;
      });

      html += '</div>';
    });

    container.innerHTML = html;
  }

  /* ========================================================
     INIT — called once when Home page first opens
     ======================================================== */

  let _refreshInterval = null;

  async function initHomePage() {
    // Parallel fetch
    const [forexResult, cryptoResult] = await Promise.all([
      fetchForex(),
      fetchCrypto()
    ]);

    renderForex(forexResult);
    renderCrypto(cryptoResult);

    // Econ calendar (separate, slower)
    fetchEconCalendar().then(renderEconCalendar);

    // Auto-refresh every 60 seconds
    if (_refreshInterval) clearInterval(_refreshInterval);
    _refreshInterval = setInterval(async () => {
      const [fx, crypto] = await Promise.all([fetchForex(), fetchCrypto()]);
      renderForex(fx);
      renderCrypto(crypto);
    }, 60_000);
  }

  /* ---- Utility ---- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Expose
  window.initHomePage = initHomePage;

})();
