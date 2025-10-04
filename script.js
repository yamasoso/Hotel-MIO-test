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
const closeBtn = modal.querySelector('.close');
const captionEl = document.getElementById('galleryCaption');
const thumbs = Array.from(document.querySelectorAll('.rooms-grid img'));
const wrapper = modal.querySelector('.gallery-swiper .swiper-wrapper');

let gallerySwiper = null;
let bodyOverflowPrev = '';

/** スライドをサムネから動的生成（初回だけ） */
function buildGallerySlides() {
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
  captionEl.textContent = active ? active.alt : '';
}

/** モーダルを開く（indexスライドへ） */
function openGallery(index) {
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
  modal.setAttribute('aria-hidden', 'false');
  // 背景スクロール抑止
  bodyOverflowPrev = document.body.style.overflow || '';
  document.body.style.overflow = 'hidden';

  // 指定のスライドへ
  if (typeof gallerySwiper.slideToLoop === 'function') {
    gallerySwiper.slideToLoop(index, 0);
  } else {
    gallerySwiper.slideTo(index, 0);
  }
  updateCaption();
  // フォーカスをモーダルへ
  modal.focus({ preventScroll: true });
}

/** モーダルを閉じる */
function closeGallery() {
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = bodyOverflowPrev;
}

// サムネクリックで起動
thumbs.forEach((img, idx) => {
  img.addEventListener('click', () => openGallery(idx));
});

// ×ボタン/背景クリックで閉じる
closeBtn.addEventListener('click', closeGallery);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeGallery();
});

// キーボード（Escで閉じる／左右はSwiperが処理）
document.addEventListener('keydown', (e) => {
  const open = modal.getAttribute('aria-hidden') === 'false';
  if (!open) return;
  if (e.key === 'Escape') closeGallery();
});
