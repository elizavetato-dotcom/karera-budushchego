// Карьера будущего — SberStudent
// Контент hero — фиксированный холст 1440px по центру, фон — полноширинный слой.

// Предекод hover-картинок карточек: при opacity:0 браузер откладывает декод,
// из-за чего первое наведение «притормаживает». Декодируем заранее.
window.addEventListener('load', function () {
  document.querySelectorAll('.step-card__hover').forEach(function (img) {
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

  // Шаг 2: заголовок + три карточки с stagger
  observeGroup('.steps__title, .steps__grid .step-card');

  // Треки: заголовок + пять карточек с stagger
  observeGroup('.tracks__title, .tracks__grid .track-card');

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
