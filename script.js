// 改善版 script.js
document.addEventListener('DOMContentLoaded', () => {
  // === Hero Swiper ===
  if (window.Swiper) {
    new Swiper('.hero-swiper', {
      loop: true,
      slidesPerView: 1,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 800,
      autoplay: { delay: 3000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
    });
  } else {
    console.warn('Swiperが読み込めていません（Hero）。');
  }

  // === Gallery Modal with Swiper ===
  const modal = document.getElementById('galleryModal');
  if (!modal) {
    // モーダルが無ければギャラリー処理は終了（安全対策）
    console.warn('galleryModal 要素が見つかりません。ギャラリー機能は無効化されます。');
    return;
  }

  // モーダルにフォーカス可能にしておく（open で focus を使うため）
  if (!modal.hasAttribute('tabindex')) modal.setAttribute('tabindex', '-1');
  if (!modal.hasAttribute('aria-hidden')) modal.setAttribute('aria-hidden', 'true');

  const closeBtn = modal.querySelector('.close');
  const captionEl = document.getElementById('galleryCaption');
  const thumbs = Array.from(document.querySelectorAll('.rooms-grid img'));
  const wrapper = modal.querySelector('.gallery-swiper .swiper-wrapper');

  let gallerySwiper = null;
  let bodyOverflowPrev = '';
  let lastFocusedEl = null;

  /** スライドをサムネから動的生成（初回だけ） */
  function buildGallerySlides() {
    if (!wrapper) return;
    if (wrapper.children.length >= thumbs.length) return; // 既に生成済み
    thumbs.forEach(img => {
      const large = img.getAttribute('data-large') || img.src;
      const alt = img.getAttribute('alt') || '';
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      const el = document.createElement('img');
      el.src = large;
      el.alt = alt;
      slide.appendChild(el);
      wrapper.appendChild(slide);
    });
  }

  /** キャプション更新 */
  function updateCaption() {
    if (!gallerySwiper) return;
    const active = modal.querySelector('.gallery-swiper .swiper-slide-active img');
    if (captionEl) captionEl.textContent = active ? active.alt : '';
  }

  /** モーダルを開く（indexスライドへ） */
  function openGallery(index) {
    if (!thumbs || thumbs.length === 0) return;
    buildGallerySlides();
    if (!gallerySwiper) {
      // 初期化（1回だけ）
      gallerySwiper = new Swiper('.gallery-swiper', {
        loop: true,
        spaceBetween: 10,
        centeredSlides: true,
        keyboard: { enabled: true },
        navigation: { nextEl: '.gallery-swiper .swiper-button-next', prevEl: '.gallery-swiper .swiper-button-prev' },
        pagination: { el: '.gallery-swiper .swiper-pagination', clickable: true },
        on: { slideChange: updateCaption }
      });
    }
    // フォーカス管理
    lastFocusedEl = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    bodyOverflowPrev = document.body.style.overflow || '';
    document.body.style.overflow = 'hidden';

    // 指定のスライドへ（loop 対応）
    if (typeof gallerySwiper.slideToLoop === 'function') {
      gallerySwiper.slideToLoop(index, 0);
    } else {
      gallerySwiper.slideTo(index, 0);
    }
    updateCaption();

    // フォーカスをモーダルへ
    try { modal.focus({ preventScroll: true }); } catch (e) { modal.focus(); }
  }

  /** モーダルを閉じる */
  function closeGallery() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = bodyOverflowPrev;
    // フォーカスを戻す
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
  }

  // サムネクリックで起動（DOMContentLoaded 内なので thumbs は揃っている想定）
  thumbs.forEach((img, idx) => {
    img.addEventListener('click', (e) => {
      e.preventDefault();
      openGallery(idx);
    });
  });

  // 閉じるボタン
  if (closeBtn) closeBtn.addEventListener('click', closeGallery);

  // モーダル外クリックで閉じる
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeGallery();
  });

  // Esc キーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeGallery();
    }
  });
});

// カテゴリ折りたたみトグル（DOMContentLoaded 内に挿入）
(function setupShopToggle() {
  const toggles = Array.from(document.querySelectorAll('.category-toggle'));
  if (!toggles.length) return;
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('aria-controls');
      const panel = document.getElementById(id);
      if (!panel) return;
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if (expanded) {
        panel.hidden = true;
      } else {
        panel.hidden = false;
      }
    });
  });
})();