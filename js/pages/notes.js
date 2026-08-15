/* ================================================================
   NOTES.JS — Notes Page: LocalStorage-backed editable card grid
   ================================================================ */

(function () {

  const NOTES_KEY = 'dashboard_notes';

  /* ---- Storage ---- */

  function loadNotes() {
    try {
      const raw = localStorage.getItem(NOTES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  }

  function saveNotes(notes) {
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('[Notes] Failed to save:', e);
    }
  }

  function genId() {
    return 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
  }

  /* ---- Helpers ---- */

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str)));
    return d.innerHTML;
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch (_) { return ''; }
  }

  /* ---- Card Creation ---- */

  function createNoteCard(note) {
    const card = document.createElement('div');
    card.className  = 'note-card';
    card.dataset.id = note.id;

    card.innerHTML = `
      <div class="note-card-header">
        <div class="note-title"
             contenteditable="true"
             spellcheck="false"
             data-field="title">${escapeHtml(note.title || '')}</div>
        <button class="note-delete-btn" title="Delete note" data-id="${note.id}">✕</button>
      </div>
      <div class="note-body"
           contenteditable="true"
           spellcheck="false"
           placeholder="Write your notes here…"
           data-field="content">${escapeHtml(note.content || '')}</div>
      <div class="note-footer">
        <span class="note-date">${formatDate(note.updatedAt || note.createdAt)}</span>
      </div>`;

    /* Auto-save on content change (debounced) */
    let saveTimer;
    card.querySelectorAll('[contenteditable]').forEach(el => {
      el.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => persistCard(note.id, card), 400);
      });

      // Prevent newlines in title
      if (el.dataset.field === 'title') {
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            card.querySelector('[data-field="content"]').focus();
          }
        });
      }
    });

    /* Delete button */
    card.querySelector('.note-delete-btn').addEventListener('click', () => {
      deleteNote(note.id);
    });

    return card;
  }

  function persistCard(id, card) {
    const notes = loadNotes();
    const idx   = notes.findIndex(n => n.id === id);
    if (idx === -1) return;

    notes[idx].title     = card.querySelector('[data-field="title"]').textContent.trim();
    notes[idx].content   = card.querySelector('[data-field="content"]').innerText.trim();
    notes[idx].updatedAt = new Date().toISOString();

    saveNotes(notes);

    // Update date display
    const dateEl = card.querySelector('.note-date');
    if (dateEl) dateEl.textContent = formatDate(notes[idx].updatedAt);
  }

  /* ---- CRUD ---- */

  function renderNotes() {
    const grid  = document.getElementById('notes-grid');
    const notes = loadNotes();

    grid.innerHTML = '';

    if (notes.length === 0) {
      grid.innerHTML = `
        <div class="notes-empty-state">
          <div class="notes-empty-icon">📝</div>
          <div class="notes-empty-text">No notes yet</div>
          <div class="notes-empty-sub">Click "+ New Note" to get started</div>
        </div>`;
      return;
    }

    notes.forEach(note => {
      grid.appendChild(createNoteCard(note));
    });
  }

  function addNote() {
    const newNote = {
      id:        genId(),
      title:     '',
      content:   '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const notes = loadNotes();
    notes.unshift(newNote);   // prepend = newest first
    saveNotes(notes);
    renderNotes();

    // Focus title of new card
    requestAnimationFrame(() => {
      const firstCard = document.querySelector('.note-card');
      if (firstCard) {
        const titleEl = firstCard.querySelector('[data-field="title"]');
        if (titleEl) {
          titleEl.focus();
          // Place caret at end
          const range = document.createRange();
          range.selectNodeContents(titleEl);
          range.collapse(false);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    });
  }

  function deleteNote(id) {
    if (!confirm('Delete this note? This cannot be undone.')) return;
    const notes = loadNotes().filter(n => n.id !== id);
    saveNotes(notes);
    renderNotes();
  }

  /* ---- Init ---- */

  function initNotesPage() {
    renderNotes();

    const btn = document.getElementById('add-note-btn');
    if (btn) {
      // Use onclick to avoid stacking listeners on repeated visits
      btn.onclick = addNote;
    }
  }

  window.initNotesPage = initNotesPage;

})();
