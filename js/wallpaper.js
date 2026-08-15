/* ================================================================
   WALLPAPER.JS — Wallpaper Handler (image / gif / video / none)
   ================================================================ */

(function () {
  /**
   * Apply wallpaper from a config object: { type, url }
   * type: 'none' | 'image' | 'gif' | 'video'
   */
  function applyWallpaper(wp) {
    const container = document.getElementById('wallpaper-bg');
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';
    container.style.backgroundImage = '';
    container.style.backgroundColor = '';

    if (!wp || wp.type === 'none' || !wp.url) {
      // Solid dark
      container.style.background = 'var(--bg-base)';
      return;
    }

    if (wp.type === 'video') {
      // Video element for MP4/WebM
      const video = document.createElement('video');
      video.src        = wp.url;
      video.autoplay   = true;
      video.loop       = true;
      video.muted      = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';

      video.addEventListener('error', () => {
        console.warn('[Wallpaper] Video failed to load:', wp.url);
        container.style.background = 'var(--bg-base)';
      });

      container.appendChild(video);
      video.play().catch(() => {
        // Autoplay blocked — silently fallback
        console.warn('[Wallpaper] Autoplay blocked');
      });

    } else {
      // image or gif — CSS background
      const img = new Image();
      img.onload = () => {
        container.style.backgroundImage  = `url('${wp.url}')`;
        container.style.backgroundSize    = 'cover';
        container.style.backgroundPosition = 'center';
        container.style.backgroundRepeat  = 'no-repeat';
      };
      img.onerror = () => {
        console.warn('[Wallpaper] Image failed to load:', wp.url);
        container.style.background = 'var(--bg-base)';
        showToast('⚠️ Wallpaper failed to load. Check the URL.');
      };
      img.src = wp.url;
    }
  }

  /** Initialize wallpaper from saved config */
  function initWallpaper() {
    const wp = Config.get('wallpaper');
    applyWallpaper(wp);
  }

  /** Called by settings modal for live preview */
  function previewWallpaper() {
    const type = document.getElementById('cfg-wp-type').value;
    const url  = document.getElementById('cfg-wp-url').value.trim();
    applyWallpaper({ type, url });
  }

  // Expose
  window.initWallpaper    = initWallpaper;
  window.applyWallpaper   = applyWallpaper;
  window.previewWallpaper = previewWallpaper;
})();
