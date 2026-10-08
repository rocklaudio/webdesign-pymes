(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Menú móvil
  --------------------------------------------------------- */
  const header = document.querySelector('.header');
  const menu = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menu && header) {
    menu.addEventListener('click', () => {
      const open = header.classList.toggle('menu-open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    header.querySelectorAll('.mobile-nav a').forEach(a => {
      a.addEventListener('click', () => {
        header.classList.remove('menu-open');
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', 'Abrir menú');
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) {
        header.classList.remove('menu-open');
        menu.setAttribute('aria-expanded', 'false');
        menu.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     Hero: carrusel con copia propia por slide + drag/swipe
  --------------------------------------------------------- */
  const hero = document.querySelector('.hero');
  const stage = document.querySelector('.hero-stage');
  const heroSlides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.dot')];
  const heroArrows = [...document.querySelectorAll('.hero-arrow')];
  const AUTOPLAY = 6500;

  let heroIndex = 0;
  let heroTimer = null;
  let paused = false;

  function showHero(index) {
    if (!heroSlides.length) return;
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, i) => {
      const active = i === heroIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === heroIndex);
      dot.setAttribute('aria-selected', String(i === heroIndex));
    });
  }

  function startHeroTimer() {
    if (reduce) return;            // sin autoplay si el usuario pidió menos movimiento
    if (heroTimer) return;
    heroTimer = setInterval(() => {
      if (!paused && !document.hidden) showHero(heroIndex + 1);
    }, AUTOPLAY);
  }

  function resetHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = null;
    startHeroTimer();
  }

  heroArrows.forEach(btn => btn.addEventListener('click', () => {
    showHero(heroIndex + Number(btn.dataset.dir));
    resetHeroTimer();
  }));

  dots.forEach(dot => dot.addEventListener('click', () => {
    showHero(Number(dot.dataset.index));
    resetHeroTimer();
  }));

  if (hero) {
    hero.addEventListener('mouseenter', () => { paused = true; });
    hero.addEventListener('mouseleave', () => { paused = false; });
    hero.addEventListener('focusin', () => { paused = true; });
    hero.addEventListener('focusout', () => { paused = false; });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) resetHeroTimer();
    });
    document.addEventListener('keydown', e => {
      if (!hero.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') { showHero(heroIndex - 1); resetHeroTimer(); }
      if (e.key === 'ArrowRight') { showHero(heroIndex + 1); resetHeroTimer(); }
    });
  }
  showHero(0);
  startHeroTimer();

  /* ---- drag / swipe (mouse, touch y lápiz) ---- */
  if (stage && heroSlides.length > 1) {
    const THRESHOLD = 70;      // px para cambiar de slide
    let startX = 0, startY = 0, deltaX = 0;
    let tracking = false, locked = false, suppressClick = false;

    const setDrag = px => stage.style.setProperty('--drag', px + 'px');

    stage.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      tracking = true;
      locked = false;
      deltaX = 0;
      startX = e.clientX;
      startY = e.clientY;
      paused = true;
    });

    window.addEventListener('pointermove', e => {
      if (!tracking) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!locked) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        locked = true;
        if (Math.abs(dy) > Math.abs(dx)) {   // gesto vertical: dejar el scroll
          tracking = false;
          paused = false;
          return;
        }
        stage.classList.add('is-dragging');
      }

      deltaX = dx;
      // resistencia en los extremos para dar sensación de límite
      const edge = (heroIndex === 0 && dx > 0) || (heroIndex === heroSlides.length - 1 && dx < 0);
      setDrag(edge ? dx * 0.28 : dx * 0.55);
      if (Math.abs(dx) > 8) suppressClick = true;
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    const endDrag = () => {
      if (!tracking && !locked) return;
      const dx = deltaX;
      tracking = false;
      locked = false;
      stage.classList.remove('is-dragging');
      setDrag(0);
      paused = false;
      resetHeroTimer();

      if (Math.abs(dx) > THRESHOLD) {
        showHero(heroIndex + (dx < 0 ? 1 : -1));
      }
      if (suppressClick) {
        setTimeout(() => { suppressClick = false; }, 60);
      }
    };

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // si hubo arrastre, el click no debe abrir el botón de debajo
    stage.addEventListener('click', e => {
      if (suppressClick) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  }

  /* ---------------------------------------------------------
     Reseñas
  --------------------------------------------------------- */
  const reviews = [...document.querySelectorAll('.review')];
  const reviewCount = document.querySelector('.review-count');
  let reviewIndex = 0;

  function showReview(index) {
    if (!reviews.length) return;
    reviewIndex = (index + reviews.length) % reviews.length;
    reviews.forEach((r, i) => r.classList.toggle('is-active', i === reviewIndex));
    if (reviewCount) {
      reviewCount.textContent =
        `${String(reviewIndex + 1).padStart(2, '0')} / ${String(reviews.length).padStart(2, '0')}`;
    }
  }

  document.querySelectorAll('.review-arrow').forEach(btn => {
    btn.addEventListener('click', () => showReview(reviewIndex + Number(btn.dataset.dir)));
  });

  if (reviews.length > 1) {
    const slider = document.querySelector('.review-slider');
    let rTimer = setInterval(next, 7000);
    function next() {
      if (!document.hidden) showReview(reviewIndex + 1);
    }
    slider.addEventListener('mouseenter', () => clearInterval(rTimer));
    slider.addEventListener('mouseleave', () => { clearInterval(rTimer); rTimer = setInterval(next, 7000); });
    slider.addEventListener('focusin', () => clearInterval(rTimer));
    slider.addEventListener('focusout', () => { clearInterval(rTimer); rTimer = setInterval(next, 7000); });
    if (reduce) clearInterval(rTimer);
  }
  showReview(0);

  /* ---------------------------------------------------------
     Parallax (suave, sobre requestAnimationFrame)
  --------------------------------------------------------- */
  const parallax = document.querySelector('.parallax');
  const parallaxImage = document.querySelector('.parallax-image');
  const parallaxCopy = document.querySelector('.parallax-copy');

  if (parallax && parallaxImage && !reduce) {
    let ticking = false;

    function updateParallax() {
      ticking = false;
      const rect = parallax.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;

      // 0 = la sección entra por abajo · 1 = terminó de salir por arriba
      const t = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const p = Math.min(1, Math.max(0, t));

      const y = (0.5 - p) * 110;             // desplazamiento del fondo
      const scale = 1.18 - 0.06 * p;         // leve zoom-out al avanzar
      const cy = (p - 0.5) * -70;            // la copia se mueve más lento (profundidad)
      const co = 1 - Math.min(0.4, Math.abs(p - 0.5) * 1.1);

      parallaxImage.style.setProperty('--py', y.toFixed(2) + 'px');
      parallaxImage.style.setProperty('--ps', scale.toFixed(3));
      if (parallaxCopy) {
        parallaxCopy.style.setProperty('--cy', cy.toFixed(2) + 'px');
        parallaxCopy.style.setProperty('--co', co.toFixed(3));
      }
    }

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateParallax);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateParallax();
  }
})();

// Reserva por WhatsApp: arma el mensaje con los datos del formulario y abre wa.me (sin backend).
(function () {
  var f = document.getElementById('reserva-form');
  if (!f) return;
  var dia = document.getElementById('rv-dia');
  if (dia) dia.min = new Date().toISOString().slice(0, 10);
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    var base = (f.getAttribute('data-wa') || '').split('?')[0];
    var partes = [
      (v('rv-nombre') || 'Hola') + ', quiero reservar en Yel Café:',
      '- Personas: ' + v('rv-personas'),
      '- Día: ' + (v('rv-dia') || '(por confirmar)'),
      '- Hora: ' + v('rv-hora')
    ];
    if (v('rv-nota')) partes.push('- Nota: ' + v('rv-nota'));
    window.open(base + '?text=' + encodeURIComponent(partes.join('\n')), '_blank', 'noopener');
  });
})();
