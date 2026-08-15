# 🏠 Chrome Home Dashboard

Custom personal home dashboard untuk Google Chrome, di-deploy ke **GitHub Pages**.  
Semua konfigurasi tersimpan di **localStorage** browser — tidak ada backend, tidak ada database.

---

## ✨ Features

### Header (semua halaman)
- 🔍 **Google Search Bar** — tekan `/` untuk fokus cepat
- 🕐 **Jam & Tanggal WIB** — update setiap detik

### Footer Navigation
- 🏠 Home · 💼 Work · 📝 Notes · 📅 Calendar

### Home Page
- 💱 **USD → IDR Live Rate** — via open.er-api.com
- ₿ **Crypto Prices** — BTC, ETH, SOL, BNB, XRP (max 5, configurable) via CoinGecko
  - Klik coin → buka TradingView chart di Bybit
  - Perubahan harga % sejak 07:00 WIB
- 📅 **Economic Calendar** — USD High Impact events via Forex Factory

### Work Page
- 📈 TradingView Advanced Chart (BYBIT:BTCUSDT)
- 💬 Discord (launch card)
- 🎵 Spotify Embed
- 📊 Bookmap + Coinglass (launch cards)
- 😨 Crypto Fear & Greed Index (SVG gauge)

### Notes Page
- Grid cards (5 kolom, unlimited rows, scroll otomatis)
- Klik `+ New Note` → card baru
- Edit langsung di dalam card (contenteditable)
- Auto-save ke localStorage
- Hapus card dengan tombol ✕

### Calendar Page
- Monthly view, Senin-Minggu
- Navigasi bulan ← →
- Klik hari → tambah event (tersimpan di localStorage)
- Highlight hari ini (WIB)

### ⚙️ Settings (tombol gear di header)
- **Wallpaper**: Image / GIF / Video (direct URL) atau None
- **Crypto Coins**: pilih max 5 dari ticker yang tersedia
- **Quick Shortcuts**: label + URL

---

## 🚀 Deploy ke GitHub Pages

### 1. Buat GitHub Repository
```
Nama repo: username.github.io  (untuk root URL)
atau
Nama apa saja            (untuk username.github.io/repo-name)
```

### 2. Upload semua file
```bash
git init
git add .
git commit -m "Initial dashboard"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### 3. Aktifkan GitHub Pages
- Buka repo di GitHub → **Settings** → **Pages**
- Source: **Deploy from branch** → branch: `main` → folder: `/ (root)`
- Klik **Save**
- URL akan muncul: `https://USERNAME.github.io/REPO/`

### 4. Set sebagai Chrome New Tab
Gunakan ekstensi **New Tab Redirect** (Chrome Web Store):
- Install ekstensi
- Set URL ke `https://USERNAME.github.io/REPO/`
- Atau: `https://USERNAME.github.io/` jika repo bernama `USERNAME.github.io`

---

## 📁 File Structure

```
index.html
css/
  main.css          ← Global styles, variables
  header.css        ← Header + Settings modal
  footer.css        ← Footer nav
  pages/
    home.css
    work.css
    notes.css
    calendar.css
js/
  config.js         ← LocalStorage config manager
  clock.js          ← WIB clock
  search.js         ← Google search
  wallpaper.js      ← Wallpaper handler
  settings.js       ← Settings modal logic
  app.js            ← Router + boot
  pages/
    home.js         ← Forex, Crypto, Econ Calendar
    work.js         ← TradingView widget, Fear & Greed
    notes.js        ← Notes CRUD
    calendar.js     ← Monthly calendar
README.md
```

---

## 🔧 LocalStorage Keys

| Key                        | Isi                              |
|----------------------------|----------------------------------|
| `dashboard_config`         | Wallpaper, crypto coins, shortcuts|
| `dashboard_notes`          | Array of note objects            |
| `dashboard_calendar_events`| Object: dateKey → events array   |

---

## 🌐 APIs Used (semua free, no API key)

| Data             | API                                    |
|------------------|----------------------------------------|
| USD/IDR Rate     | open.er-api.com / frankfurter.app      |
| Crypto Prices    | api.coingecko.com                      |
| Econ Calendar    | nfs.faireconomy.media (Forex Factory)  |
| Fear & Greed     | api.alternative.me/fng                 |
| TradingView Chart| s3.tradingview.com/tv.js (widget)     |

---

## 💡 Tips

- **Wallpaper video**: gunakan direct link `.mp4` atau `.webm` (bukan YouTube)
- **Wallpaper GIF**: gunakan link dari imgur, giphy, dsb.
- **Crypto symbol**: ketik simbol di settings (BTC, ETH, SOL, dll.)
- **Economic Calendar**: data direfresh setiap halaman Home dibuka
- **Keyboard**: tekan `/` untuk fokus ke search bar
