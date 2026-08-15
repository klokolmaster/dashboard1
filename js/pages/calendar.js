/* ================================================================
   CALENDAR.JS — Monthly Calendar with LocalStorage Events
   ================================================================ */

(function () {

  const EVENTS_KEY = 'dashboard_calendar_events';

  let _month = -1;
  let _year  = -1;

  /* ---- Init current WIB month/year ---- */
  function initCurrentPeriod() {
    if (_month === -1) {
      // Use WIB date
      const wib  = typeof getWIBDate === 'function' ? getWIBDate() : new Date();
      _month = wib.getMonth();
      _year  = wib.getFullYear();
    }
  }

  /* ---- Storage ---- */

  function loadEvents() {
    try {
      return JSON.parse(localStorage.getItem(EVENTS_KEY)) || {};
    } catch (_) { return {}; }
  }

  function saveEvents(events) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }

  function addEvent(dateKey, text) {
    const events = loadEvents();
    if (!events[dateKey]) events[dateKey] = [];
    events[dateKey].push(text);
    saveEvents(events);
  }

  function removeEvent(dateKey, idx) {
    const events = loadEvents();
    if (!events[dateKey]) return;
    events[dateKey].splice(idx, 1);
    if (events[dateKey].length === 0) delete events[dateKey];
    saveEvents(events);
  }

  /* ---- Render Calendar ---- */

  const MONTHS_ID = typeof window.ID_MONTHS !== 'undefined'
    ? window.ID_MONTHS
    : ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  function renderCalendar() {
    initCurrentPeriod();

    const label = document.getElementById('cal-month-label');
    if (label) label.textContent = `${MONTHS_ID[_month]} ${_year}`;

    const grid   = document.getElementById('cal-days-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const events       = loadEvents();
    const wibNow       = typeof getWIBDate === 'function' ? getWIBDate() : new Date();
    const isThisMonth  = wibNow.getMonth() === _month && wibNow.getFullYear() === _year;
    const todayNum     = wibNow.getDate();

    // First weekday of this month (0=Sun..6=Sat)
    const firstDow     = new Date(_year, _month, 1).getDay();
    // Offset for Monday-start grid: Mon=0, Tue=1, ..., Sun=6
    const offset       = (firstDow + 6) % 7;

    const daysInMonth  = new Date(_year, _month + 1, 0).getDate();
    const daysInPrev   = new Date(_year, _month,     0).getDate();

    // -- Previous month trailing days --
    for (let i = offset - 1; i >= 0; i--) {
      grid.appendChild(makeDayCell(daysInPrev - i, null, true, false));
    }

    // -- Current month days --
    for (let d = 1; d <= daysInMonth; d++) {
      const dow      = new Date(_year, _month, d).getDay();
      const isWeekend = dow === 0 || dow === 6;
      const dateKey  = `${_year}-${pad(_month + 1)}-${pad(d)}`;
      const isToday  = isThisMonth && d === todayNum;
      const dayEvs   = events[dateKey] || [];

      const cell = makeDayCell(d, dateKey, false, isWeekend, isToday, dayEvs);
      grid.appendChild(cell);
    }

    // -- Next month leading days --
    const totalSoFar = offset + daysInMonth;
    const remaining  = (7 - (totalSoFar % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      grid.appendChild(makeDayCell(i, null, true, false));
    }
  }

  function makeDayCell(dayNum, dateKey, otherMonth, isWeekend, isToday, dayEvents) {
    const cell = document.createElement('div');

    let cls = 'cal-day';
    if (otherMonth)  cls += ' other-month';
    if (isWeekend)   cls += ' weekend';
    if (isToday)     cls += ' today';
    cell.className = cls;

    const hasEvents = dayEvents && dayEvents.length > 0;

    cell.innerHTML = `
      <span class="cal-day-num">${dayNum}</span>
      ${hasEvents ? '<div class="cal-event-dot"></div>' : ''}`;

    if (!otherMonth && dateKey) {
      cell.addEventListener('click', () => handleDayClick(dateKey, dayNum, dayEvents));
    }

    return cell;
  }

  function handleDayClick(dateKey, dayNum, existingEvents) {
    // Build message
    const evList = existingEvents && existingEvents.length > 0
      ? 'Events:\n' + existingEvents.map((e, i) => `${i + 1}. ${e}`).join('\n') + '\n\n'
      : '';

    const input = window.prompt(
      `📅 ${dateKey}\n\n${evList}Type a new event (leave blank to cancel):`
    );

    if (input && input.trim()) {
      addEvent(dateKey, input.trim());
      renderCalendar();
    }
  }

  /* ---- Navigation ---- */

  function prevMonth() {
    initCurrentPeriod();
    _month--;
    if (_month < 0) { _month = 11; _year--; }
    renderCalendar();
  }

  function nextMonth() {
    initCurrentPeriod();
    _month++;
    if (_month > 11) { _month = 0; _year++; }
    renderCalendar();
  }

  /* ---- Utility ---- */
  function pad(n) { return String(n).padStart(2, '0'); }

  /* ---- Init ---- */

  function initCalendarPage() {
    initCurrentPeriod();

    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');
    if (prevBtn) prevBtn.addEventListener('click', prevMonth);
    if (nextBtn) nextBtn.addEventListener('click', nextMonth);

    renderCalendar();
  }

  window.initCalendarPage = initCalendarPage;

})();
