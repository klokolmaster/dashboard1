/* ================================================================
   CLOCK.JS — Real-time WIB (UTC+7) Clock
   ================================================================ */

(function () {
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

  const ID_DAYS = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];

  const ID_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  function getWIBDate() {
    // Convert current UTC to WIB (UTC+7)
    const utcMs   = Date.now() + new Date().getTimezoneOffset() * 60_000;
    return new Date(utcMs + WIB_OFFSET_MS);
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    const now = getWIBDate();

    const h = pad(now.getHours());
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());

    const dayName   = ID_DAYS[now.getDay()];
    const date      = now.getDate();
    const monthName = ID_MONTHS[now.getMonth()];
    const year      = now.getFullYear();

    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');

    if (timeEl) timeEl.textContent = `${h}:${m}:${s}`;
    if (dateEl) dateEl.textContent = `${dayName}, ${date} ${monthName} ${year}`;
  }

  function initClock() {
    tick();                          // immediate first render
    setInterval(tick, 1000);        // update every second
  }

  // Expose for app.js
  window.initClock    = initClock;
  window.getWIBDate   = getWIBDate;
  window.ID_MONTHS    = ID_MONTHS;
  window.ID_DAYS      = ID_DAYS;
})();
