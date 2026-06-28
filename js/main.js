// Карьера будущего — SberStudent
// Контент hero — фиксированный холст 1440px по центру, фон — полноширинный слой.

// Предекод hover-картинок карточек: при opacity:0 браузер откладывает декод,
// из-за чего первое наведение «притормаживает». Декодируем заранее.
window.addEventListener('load', function () {
  document.querySelectorAll('.step-card__hover, .step-card__img-m--hover').forEach(function (img) {
    if (img.decode) {
      img.decode().catch(function () {});
    }
  });
});

// Scroll-анимации — Intersection Observer
(function () {
  if (!window.IntersectionObserver) return;

  function observeGroup(selector) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;

    els.forEach(function (el) { el.classList.add('js-anim'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    els.forEach(function (el) { io.observe(el); });
  }

  // Шаг 2: заголовок + три карточки с stagger (одноразовый въезд)
  observeGroup('.steps__title, .steps__grid .step-card');

  // Карточки шагов: активное состояние (всплывающие плашки) на мобилке.
  // Переключается, а не залипает: появляется при доскролле до карточки,
  // уходит когда карточка покидает экран, возвращается при повторном показе.
  var stepCards = document.querySelectorAll('.step-card');
  if (stepCards.length) {
    var stepActiveIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-active', entry.isIntersecting);
      });
    }, { threshold: 0.5 });
    stepCards.forEach(function (el) { stepActiveIO.observe(el); });
  }

  // Треки: только заголовок (у карточек своя логика — активное состояние
  // по центрированию в горизонтальном скролле, без entrance-анимации)
  observeGroup('.tracks__title');

  // Программа: карточки въезжают с разных сторон
  var slideIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        slideIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  // FAQ: заголовок + sidebar-карточки + accordion-items
  observeGroup('.faq__title, .faq-card--email, .faq-card--subscribe, .faq__list .faq__item');

  // CTA: заголовок → описание → кнопка
  observeGroup('.cta__title, .cta__desc, .cta__btn');

  var progBase  = document.querySelector('.prog-card--base');
  var progTrack = document.querySelector('.prog-card--track');
  if (progBase)  { progBase.classList.add('js-slide-left');  slideIO.observe(progBase); }
  if (progTrack) { progTrack.classList.add('js-slide-right'); slideIO.observe(progTrack); }
}());

// Модальное окно трека
(function () {
  var overlay = document.getElementById('modal-ai');
  if (!overlay) return;

  var modal = overlay.querySelector('.modal');
  var closeBtn = overlay.querySelector('.modal__close');

  function openModal() {
    overlay.removeAttribute('aria-hidden');
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
  });

  document.querySelectorAll('[data-modal="ai"]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });
}());

// Горизонтальный скролл треков всегда стартует с первой карточки
// (защита от восстановления позиции скролла браузером при перезагрузке)
(function () {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var grid = document.querySelector('.tracks__grid');
  if (!grid) return;
  function reset() { grid.scrollLeft = 0; }
  reset();
  requestAnimationFrame(reset);
  window.addEventListener('load', function () { reset(); setTimeout(reset, 250); });

  // Пагинация: активная точка синхронизируется со скроллом, клик по точке
  // плавно листает к нужной карточке.
  var dots = document.querySelectorAll('.tracks__dots .tracks__dot');
  var cards = grid.querySelectorAll('.track-card');
  if (!dots.length || !cards.length) return;

  function activeIndex() {
    var mid = grid.scrollLeft + grid.clientWidth / 2;
    var best = 0, bestDist = Infinity;
    cards.forEach(function (c, i) {
      var center = c.offsetLeft + c.offsetWidth / 2;
      var d = Math.abs(center - mid);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }
  function syncDots() {
    var idx = activeIndex();
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
    // карточка по центру экрана получает «hover»-состояние (как на десктопе)
    cards.forEach(function (c, i) { c.classList.toggle('is-center', i === idx); });
  }
  var ticking = false;
  grid.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { syncDots(); ticking = false; });
  }, { passive: true });
  dots.forEach(function (d, i) {
    d.addEventListener('click', function () {
      grid.scrollTo({ left: cards[i].offsetLeft - 20, behavior: 'smooth' });
    });
  });
  syncDots();
}());

// FAQ Accordion (defer — DOM готов, DOMContentLoaded не нужен)
document.querySelectorAll('.faq__question').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item = btn.closest('.faq__item');
    var isOpen = item.classList.contains('is-open');

    // Закрываем все открытые
    document.querySelectorAll('.faq__item.is-open').forEach(function (el) {
      el.classList.remove('is-open');
      el.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
    });

    // Открываем текущий, если был закрыт
    if (!isOpen) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});
