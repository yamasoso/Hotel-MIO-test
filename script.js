// script.js - 起動ログ + price-table の正規化（既存処理は維持）
//           + Swiper (hero/gallery) 初期化と再初期化
//           + ルーム画像ギャラリー（モーダル）
//           + カラオケの部屋バッジ追加を廃止（既存のマークは非表示にするのみ）
document.addEventListener('DOMContentLoaded', function () {
  console.info('[script.js] loaded');

  /* =========================
     既存: price-table 正規化
  ========================= */
  (function normalizeTableLabelsAndPlans(){
    try {
      const tables = document.querySelectorAll('.price-table table');
      if (!tables.length) return;

      tables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(h => h.textContent.trim());
        const tbodyRows = Array.from(table.querySelectorAll('tbody tr'));
        const occupied = new Array(headers.length).fill(null);

        tbodyRows.forEach(row => {
          const cells = Array.from(row.children).filter(n => n.tagName.toLowerCase() === 'td' || n.tagName.toLowerCase() === 'th');
          let cellIdx = 0;
          let colIndex = 0;
          let planValueForRow = null;
          let hasPlanInRow = false;

          while (colIndex < headers.length) {
            while (colIndex < headers.length && occupied[colIndex]) {
              if (occupied[colIndex].value != null && planValueForRow == null) {
                planValueForRow = occupied[colIndex].value;
              }
              occupied[colIndex].remaining--;
              if (occupied[colIndex].remaining <= 0) occupied[colIndex] = null;
              colIndex++;
            }
            if (colIndex >= headers.length) break;

            const cell = cells[cellIdx++];
            if (!cell) break;
            const colspan = parseInt(cell.getAttribute('colspan') || 1, 10);
            const rowspan = parseInt(cell.getAttribute('rowspan') || 1, 10);
            const label = headers.slice(colIndex, colIndex + colspan).join(' / ');
            cell.setAttribute('data-label', label + ':');
            const mapsToPlan = headers[0] && label.split(' / ')[0].indexOf('プラン') !== -1;

            if (mapsToPlan) {
              const val = cell.textContent.trim();
              planValueForRow = val;
              hasPlanInRow = true;
              if (rowspan > 1) {
                for (let k = 0; k < colspan; k++) occupied[colIndex + k] = { remaining: rowspan - 1, value: val };
              }
            } else {
              if (rowspan > 1) {
                const val = cell.textContent.trim();
                for (let k = 0; k < colspan; k++) occupied[colIndex + k] = { remaining: rowspan - 1, value: val };
              }
            }
            colIndex += colspan;
          }

          if (!planValueForRow) {
            for (let i = 0; i < headers.length; i++) {
              if (occupied[i] && occupied[i].value) { planValueForRow = occupied[i].value; break; }
            }
          }

          row.setAttribute('data-plan', planValueForRow ? planValueForRow : '');
          row.setAttribute('data-has-plan', hasPlanInRow ? 'true' : 'false');
        });
      });
      console.info('[script.js] price-table normalized');
    } catch (e) {
      console.error('[script.js] price-table normalization error', e);
    }
  })();

  /* =========================
     shop トグル: 初期で全て開く（既存処理維持）
  ========================= */
  (function setupShopTogglesAndOpenAll(){
    try {
      const toggles = document.querySelectorAll('.category-toggle');
      document.querySelectorAll('.shop-table-wrap').forEach(wrap => wrap.removeAttribute('hidden'));
      toggles.forEach(btn => {
        btn.setAttribute('aria-expanded', 'true');
        btn.addEventListener('click', () => {
          const expanded = btn.getAttribute('aria-expanded') === 'true';
          const targetId = btn.getAttribute('aria-controls');
          const target = targetId ? document.getElementById(targetId) : null;
          if (target) {
            if (expanded) {
              target.setAttribute('hidden', '');
              btn.setAttribute('aria-expanded', 'false');
            } else {
              target.removeAttribute('hidden');
              btn.setAttribute('aria-expanded', 'true');
            }
          } else {
            btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
          }
        });
      });
      console.info('[script.js] shop toggles setup (opened all)');
    } catch (e) {
      console.error('[script.js] shop toggles error', e);
    }
  })();

  /* =========================
     Karaoke: 部屋バッジは追加しない。
     ページ内の既存カラオケ表記（もし部屋カードに付いているマーク等）があれば非表示にするのみ。
     アメニティ欄の記載はそのまま残す（管理者が明記しているため十分）。
  ========================= */
  (function hideRoomKaraokeMarkers(){
    try {
      console.info('[script.js] hideRoomKaraokeMarkers start');
      // 非表示対象セレクタ（存在すれば非表示）
      const karaokeSelectors = ['.karaoke', '.badge.karaoke', '.has-karaoke', '.facility-karaoke', '.karaoke-flag', '.karaoke-badge'];
      karaokeSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          el.style.display = 'none';
        });
      });
      console.info('[script.js] Karaoke markers hidden; rely on AMENITIES section for details');
    } catch (e) {
      console.error('[script.js] hideRoomKaraokeMarkers error', e);
    }
  })();

  /* =========================
     Swiper 初期化（hero）
  ========================= */
  (function initHeroSwiper(){
    try {
      if (typeof Swiper !== 'function') {
        console.warn('[script.js] Swiper not found. Make sure swiper bundle script is loaded.');
        return;
      }
      try { if (window.__heroSwiper && typeof window.__heroSwiper.destroy === 'function') window.__heroSwiper.destroy(true, true); } catch(e){}
      window.__heroSwiper = new Swiper('.hero-swiper', {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 0,
        pagination: { el: '.hero-swiper .swiper-pagination', clickable: true },
        navigation: { nextEl: '.hero-swiper .swiper-button-next', prevEl: '.hero-swiper .swiper-button-prev' },
        autoplay: { delay: 5000, disableOnInteraction: false },
        simulateTouch: true,
        allowTouchMove: true,
      });
      console.info('[script.js] hero Swiper initialized');
    } catch (e) {
      console.error('[script.js] initHeroSwiper error', e);
    }
  })();

  /* =========================
     ルーム画像クリックでギャラリーモーダルを開く
  ========================= */
  (function setupRoomGallery(){
    try {
      const modal = document.getElementById('galleryModal');
      const modalWrapper = modal ? modal.querySelector('.swiper .swiper-wrapper') : null;
      const caption = document.getElementById('galleryCaption');
      let gallerySwiper = null;

      const roomImgs = Array.from(document.querySelectorAll('.rooms-grid .room img'));
      if (!roomImgs.length) {
        console.info('[script.js] No room images found for gallery');
        return;
      }

      function buildSlides() {
        if (!modalWrapper) return;
        modalWrapper.innerHTML = '';
        roomImgs.forEach(img => {
          const slide = document.createElement('div');
          slide.className = 'swiper-slide';
          const im = document.createElement('img');
          im.src = img.getAttribute('data-large') || img.getAttribute('data-src') || img.src;
          im.alt = img.alt || '';
          im.style.cssText = 'width:100%;height:auto;display:block;margin:0 auto;max-height:80vh;object-fit:contain';
          slide.appendChild(im);
          modalWrapper.appendChild(slide);
        });
      }

      function openModalAt(index) {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        buildSlides();
        if (typeof Swiper !== 'function') {
          console.warn('[script.js] Swiper not found - gallery will not be interactive');
          return;
        }
        try { if (gallerySwiper && typeof gallerySwiper.destroy === 'function') gallerySwiper.destroy(true, true); } catch(e){}
        gallerySwiper = new Swiper('.gallery-swiper', {
          loop: false,
          slidesPerView: 1,
          spaceBetween: 10,
          navigation: { nextEl: '.gallery-swiper .swiper-button-next', prevEl: '.gallery-swiper .swiper-button-prev' },
          pagination: { el: '.gallery-swiper .swiper-pagination', clickable: true },
          initialSlide: Math.max(0, Math.min(roomImgs.length - 1, index || 0)),
        });
        setCaption(gallerySwiper.activeIndex);
        gallerySwiper.on('slideChange', () => setCaption(gallerySwiper.activeIndex));
      }

      function closeModal() {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        try { if (gallerySwiper && typeof gallerySwiper.destroy === 'function') { gallerySwiper.destroy(true, true); gallerySwiper = null; } } catch(e){}
      }

      function setCaption(i) {
        if (!caption) return;
        caption.textContent = roomImgs[i] ? (roomImgs[i].alt || ('Room ' + (i+1))) : '';
      }

      document.body.addEventListener('click', function (ev) {
        const img = ev.target.closest('.rooms-grid .room img');
        if (!img) return;
        if (img.closest('a')) return;
        ev.preventDefault();
        const idx = roomImgs.indexOf(img);
        if (idx === -1) return;
        openModalAt(idx);
      });

      if (modal) {
        modal.addEventListener('click', function(e){
          if (e.target === modal) closeModal();
        });
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeModal(); });
      }

      console.info('[script.js] room gallery setup complete');
    } catch (e) {
      console.error('[script.js] setupRoomGallery error', e);
    }
  })();

  console.info('[script.js] all init done');
});