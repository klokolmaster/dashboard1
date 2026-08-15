/* ================================================================
   HOME.JS — Home Page: USD/IDR Forex, Crypto Prices, Econ Calendar
   ================================================================ */

(function () {

  /* ---- Coin mappings ---- */
  const COIN_META = {
    BTC:   { id: 'bitcoin',      logoClass: 'logo-btc',   sym: '₿' },
    ETH:   { id: 'ethereum',     logoClass: 'logo-eth',   sym: 'Ξ' },
    SOL:   { id: 'solana',       logoClass: 'logo-sol',   sym: '◎' },
    BNB:   { id: 'binancecoin',  logoClass: 'logo-bnb',   sym: 'B' },
    XRP:   { id: 'ripple',       logoClass: 'logo-xrp',   sym: '✕' },
    ADA:   { id: 'cardano',      logoClass: 'logo-ada',   sym: '₳' },
    DOGE:  { id: 'dogecoin',     logoClass: 'logo-doge',  sym: 'Ð' },
    AVAX:  { id: 'avalanche-2',  logoClass: 'logo-avax',  sym: 'A' },
    DOT:   { id: 'polkadot',     logoClass: 'logo-dot',   sym: '●' },
    LINK:  { id: 'chainlink',    logoClass: 'logo-link',  sym: '⬡' },
    UNI:   { id: 'uniswap',      logoClass: 'logo-uni',   sym: '🦄' },
    MATIC: { id: 'matic-network',logoClass: 'logo-matic', sym: 'M' },
  };

  function getMeta(ticker) {
    return COIN_META[ticker.toUpperCase()] || { id: ticker.toLowerCase(), logoClass: 'logo-default', sym: ticker.charAt(0) };
  }

  function bybitTV(ticker) {
    return `https://www.tradingview.com/chart/?symbol=BYBIT:${ticker.toUpperCase()}USDT`;
  }

  /* ============================================================
     1. FOREX — USD → IDR
     ============================================================ */

  async function fetchForex() {
    const urls = [
      'https://open.er-api.com/v6/latest/USD',
      'https://api.frankfurter.app/latest?from=USD&to=IDR'
    ];
    for (const url of urls) {
      try {
        const res  = await fetch(url, { signal: AbortSignal.timeout(7000) });
        const data = await res.json();
        if (data.rates?.IDR) return { rate: data.rates.IDR, success: true, src: new URL(url).hostname };
      } catch (_) {}
    }
    return { success: false };
  }

  function renderForex(res) {
    const card = document.getElementById('forex-card');
    if (!card) return;

    if (!res.success) {
      card.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <div>Rate unavailable</div>
          <a href="https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=IDR" target="_blank" rel="noopener">View on XE ↗</a>
        </div>`;
      return;
    }

    const fmt = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

    card.innerHTML = `
      <div class="forex-card-inner">
        <div class="forex-top">
          <div class="forex-pair-row">
            <span class="forex-flag">🇺🇸</span>
            <span class="forex-arrow">→</span>
            <span class="forex-flag">🇮🇩</span>
            <span class="forex-pair-label">USD / IDR</span>
          </div>
          <div class="icon-badge badge-teal">💱</div>
        </div>
        <div class="forex-rate-value">${fmt.format(Math.round(res.rate))}</div>
        <div class="forex-rate-unit">per 1 US Dollar</div>
        <div class="forex-source">
          <div class="forex-source-dot"></div>
          <span>Live · ${res.src || 'open.er-api.com'}</span>
        </div>
      </div>`;
  }

  /* ============================================================
     2. CRYPTO PRICES — CoinGecko (free)
     ============================================================ */

  async function fetchCrypto() {
    const coins = (Config.get('crypto').coins || ['BTC','ETH','SOL','BNB','XRP']).slice(0, 5);
    const ids   = coins.map(c => getMeta(c).id).join(',');
    const url   = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&precision=4`;
    try {
      const res  = await fetch(url, { signal: AbortSignal.timeout(9000) });
      const data = await res.json();
      return { success: true, data, coins };
    } catch (e) {
      return { success: false, coins };
    }
  }

  function fmtPrice(p) {
    if (p == null) return 'N/A';
    if (p >= 10000) return '$' + new Intl.NumberFormat('en-US').format(Math.round(p));
    if (p >= 1)     return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 0.01)  return '$' + p.toFixed(4);
    return '$' + p.toFixed(6);
  }

  function renderCrypto(res) {
    const el = document.getElementById('crypto-list');
    if (!el) return;

    if (!res.success) {
      el.innerHTML = `
        <div class="error-state">
          <div class="error-icon">⚠️</div>
          <div>Prices unavailable</div>
          <a href="https://www.coingecko.com" target="_blank" rel="noopener">View on CoinGecko ↗</a>
        </div>`;
      return;
    }

    let html = '';
    res.coins.forEach(ticker => {
      const meta   = getMeta(ticker);
      const info   = res.data[meta.id];
      if (!info) return;

      const price  = info.usd;
      const change = info.usd_24h_change || 0;
      const isUp   = change >= 0;
      const sign   = isUp ? '+' : '';

      html += `
        <a href="${bybitTV(ticker)}" target="_blank" rel="noopener" class="crypto-row"
           title="Open ${ticker.toUpperCase()} on TradingView (Bybit)">
          <div class="crypto-row-left">
            <div class="crypto-logo ${meta.logoClass}">${meta.sym}</div>
            <div class="crypto-info">
              <div class="crypto-symbol">${ticker.toUpperCase()}</div>
              <div class="crypto-name">${meta.id.replace(/-/g,' ')}</div>
            </div>
          </div>
          <div class="crypto-row-right">
            <div class="crypto-price">${fmtPrice(price)}</div>
            <div class="crypto-change ${isUp ? 'positive' : 'negative'}">${sign}${change.toFixed(2)}%</div>
          </div>
        </a>`;
    });

    el.innerHTML = html || `<div class="error-state"><div>No data</div></div>`;
  }

  /* ============================================================
     3. ECONOMIC CALENDAR — Forex Factory
     ============================================================ */

  const FF_URL     = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
  const PROXIES    = [
    (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`
  ];

  async function fetchEcon() {
    const tries = [FF_URL, ...PROXIES.map(fn => fn(FF_URL))];
    for (const url of tries) {
      try {
        const res  = await fetch(url, { signal: AbortSignal.timeout(9000) });
        let   data = await res.json();
        if (data?.contents) data = JSON.parse(data.contents);
        if (Array.isArray(data)) return data;
      } catch (_) {}
    }
    return null;
  }

  function etToWIB(t) {
    if (!t || t === 'All Day' || t === '') return 'All Day';
    const m = t.match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
    if (!m) return t;
    let [, h, min, mer] = m;
    h = parseInt(h); min = parseInt(min);
    if (mer.toLowerCase() === 'pm' && h !== 12) h += 12;
    if (mer.toLowerCase() === 'am' && h === 12) h = 0;
    return `${String((h + 11) % 24).padStart(2,'0')}:${String(min).padStart(2,'0')} WIB`;
  }

  function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function renderEcon(events) {
    const el = document.getElementById('econ-list');
    if (!el) return;

    if (!events) {
      el.innerHTML = `
        <div class="error-state">
          <div class="error-icon">📅</div>
          <div>Calendar unavailable</div>
          <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener">View on ForexFactory ↗</a>
        </div>`;
      return;
    }

    const high = events.filter(e => e.country === 'USD' && e.impact === 'High');

    if (!high.length) {
      el.innerHTML = `
        <div class="error-state">
          <div class="error-icon">✅</div>
          <div>No high-impact USD events this week</div>
        </div>`;
      return;
    }

    const byDate = {};
    high.forEach(e => {
      const k = (e.date || '').split('T')[0] || 'Unknown';
      (byDate[k] = byDate[k] || []).push(e);
    });

    const DS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    const MS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    let html = '';

    Object.keys(byDate).sort().forEach(k => {
      let lbl = k;
      try { const d = new Date(k+'T12:00:00Z'); lbl = `${DS[d.getUTCDay()]}, ${d.getUTCDate()} ${MS[d.getUTCMonth()]}`; } catch(_) {}
      html += `<div class="econ-date-group"><div class="econ-date-label">${lbl}</div>`;
      byDate[k].forEach(ev => {
        const actual = ev.actual || '';
        html += `
          <div class="econ-event">
            <div class="econ-event-time">${etToWIB(ev.time||'')}</div>
            <div class="econ-event-info">
              <div class="econ-event-name">${esc(ev.title||'')}</div>
              <div class="econ-event-data">
                ${actual ? `<span class="econ-actual">A: ${esc(actual)}</span>` : ''}
                <span class="econ-forecast">F: ${esc(ev.forecast||'-')}</span>
                <span class="econ-previous">P: ${esc(ev.previous||'-')}</span>
              </div>
            </div>
          </div>`;
      });
      html += '</div>';
    });

    el.innerHTML = html;
  }

  /* ============================================================
     INIT
     ============================================================ */
  let _timer = null;

  async function initHomePage() {
    if (_timer) clearInterval(_timer);

    const [fx, crypto] = await Promise.all([fetchForex(), fetchCrypto()]);
    renderForex(fx);
    renderCrypto(crypto);
    fetchEcon().then(renderEcon);

    _timer = setInterval(async () => {
      const [f, c] = await Promise.all([fetchForex(), fetchCrypto()]);
      renderForex(f);
      renderCrypto(c);
    }, 60_000);
  }

  window.initHomePage = initHomePage;

})();
