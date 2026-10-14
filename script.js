const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');

        // Переключаем активный (подчёркнутый) пункт меню
        nav.querySelectorAll('a').forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
      });
    });

    // ===== Слайдер галереи =====
    const gsViewport = document.getElementById('gslider-viewport');
    const gsPrev = document.getElementById('gslider-prev');
    const gsNext = document.getElementById('gslider-next');

    // Клонируем слайды — для бесшовного «плывущего» цикла
    const gsSlides = Array.from(gsViewport.querySelectorAll('.gslider__slide'));
    gsSlides.forEach(slide => gsViewport.appendChild(slide.cloneNode(true)));

    const gsGap = () => parseFloat(getComputedStyle(gsViewport).columnGap) || 16;

    // Шаг стрелок = ширина одного слайда + отступ
    function gsStep() {
      const slide = gsSlides[0];
      return slide.getBoundingClientRect().width + gsGap();
    }

    // Ширина одного «набора» (оригинальные слайды) — граница бесшовного цикла
    function gsSetWidth() {
      return gsSlides.reduce((sum, s) => sum + s.getBoundingClientRect().width + gsGap(), 0);
    }

    const gsSpeed = 0.5; // пикселей за кадр — медленно и плавно
    let gsPaused = false;
    let gsVisible = true;

    // Ставим на паузу, когда секция уходит за пределы экрана
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => entries.forEach(e => (gsVisible = e.isIntersecting)))
        .observe(gsViewport);
    }

    function gsFloat() {
      if (!gsPaused && gsVisible) {
        const setWidth = gsSetWidth();
        if (gsViewport.scrollLeft >= setWidth) {
          gsViewport.scrollLeft -= setWidth; // бесшовный возврат в начало
        } else {
          gsViewport.scrollLeft += gsSpeed;
        }
      }
      requestAnimationFrame(gsFloat);
    }

    // При наведении — замереть, чтобы можно было рассмотреть фото
    gsViewport.addEventListener('pointerenter', () => (gsPaused = true));
    gsViewport.addEventListener('pointerleave', () => (gsPaused = false));

    // Стрелки: на миг замираем и плавно листаем на один слайд
    function gsNudge(dir) {
      gsPaused = true;
      clearTimeout(gsNudge._t);
      gsViewport.scrollBy({ left: dir * gsStep(), behavior: 'smooth' });
      gsNudge._t = setTimeout(() => (gsPaused = false), 600);
    }
    gsPrev.addEventListener('click', () => gsNudge(-1));
    gsNext.addEventListener('click', () => gsNudge(1));

    // Уважаем системную настройку «уменьшить анимацию»
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(gsFloat);
    }

    // ===== Сезонные эффекты: листья (осень) / снежинки (зима) =====
    (function () {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const layer = document.getElementById('seasonFx');
      if (reduce || !layer) return;

      // Северное полушарие: зима — дек, янв, фев
      const month = new Date().getMonth(); // 0..11
      let type = null;
      if (month === 11 || month === 0 || month === 1) type = 'snow'; // зима

      if (!type) return; // весна/лето — без эффекта

      const isSnow = type === 'snow';
      const COUNT = isSnow ? 40 : 22;
      const leafColors = ['#ff7a1a', '#e9660a', '#c8791a', '#b5531b', '#d99a2b'];

      const rand = (min, max) => Math.random() * (max - min) + min;

      const frag = document.createDocumentFragment();
      for (let i = 0; i < COUNT; i++) {
        const el = document.createElement('span');
        el.className = 'season-fx__item season-fx__item--' + type;

        const left = rand(0, 100); // позиция по горизонтали, %
        const duration = rand(isSnow ? 9 : 8, isSnow ? 18 : 15); // длительность падения, с
        const delay = rand(0, isSnow ? 12 : 10); // задержка старта, с
        const drift = rand(-60, 60); // снос по ветру, px
        const size = isSnow ? rand(3, 7) : rand(8, 15);
        const opacity = isSnow ? rand(.5, .95) : rand(.6, .95);

        el.style.left = left + 'vw';
        el.style.animationDuration = duration + 's';
        el.style.animationDelay = '-' + delay + 's';
        el.style.setProperty('--drift', drift.toFixed(1) + 'px');
        el.style.setProperty('--size', size.toFixed(1) + 'px');
        el.style.setProperty('--op', opacity.toFixed(2));
        if (!isSnow) {
          el.style.setProperty('--rot', rand(-540, 540).toFixed(0) + 'deg');
          el.style.setProperty('--leaf', leafColors[(Math.random() * leafColors.length) | 0]);
        }

        frag.appendChild(el);
      }
      layer.appendChild(frag);
    })();

    // ===== Замедляем фоновое видео в hero =====
    const heroVideo = document.querySelector('.hero__video');
    if (heroVideo) {
      heroVideo.playbackRate = 0.5; // 0.5 — вдвое медленнее обычного
    }