document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.section-4');
  const wrapper = section.querySelector('.wrapper');
  const track = section.querySelector('.slides-track');
  const originalSlides = Array.from(track.children);
  const prevBtn = section.querySelector('.arrow-left');
  const nextBtn = section.querySelector('.arrow-right');
  const currentPageEl = section.querySelector('.current-page');
  const totalPagesEl = section.querySelector('.total-pages');

  const GAP = 20;  // должен совпадать с gap в CSS (20px)

  let totalSlides = originalSlides.length;
  let visibleSlides = getVisibleSlides();
  let totalPages = Math.ceil(totalSlides / visibleSlides);
  let currentPage = 0;
  let autoPlayInterval = null;
  let isTransitioning = false;

  // ----- Определение количества видимых слайдов -----
  function getVisibleSlides() {
    const width = window.innerWidth;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  }

  // ----- Построение бесконечной дорожки (клоны) -----
  function buildInfiniteTrack() {
    track.innerHTML = '';
    if (totalSlides <= visibleSlides) {
      originalSlides.forEach(s => track.appendChild(s));
      return;
    }
    // клоны слева
    for (let i = totalSlides - visibleSlides; i < totalSlides; i++) {
      track.appendChild(originalSlides[i].cloneNode(true));
    }
    // оригиналы
    originalSlides.forEach(s => track.appendChild(s));
    // клоны справа
    for (let i = 0; i < visibleSlides; i++) {
      track.appendChild(originalSlides[i].cloneNode(true));
    }
  }

  // ----- Расчёт ширины слайда и позиционирование -----
  function setSizesAndPosition() {
    const wrapperWidth = wrapper.clientWidth;
    const slideWidth = (wrapperWidth - GAP * (visibleSlides - 1)) / visibleSlides;
    const allSlides = track.querySelectorAll('.slide');

    allSlides.forEach(slide => {
      slide.style.width = slideWidth + 'px';
    });

    // Ширина трека (без последнего gap)
    const trackWidth = allSlides.length * (slideWidth + GAP) - GAP;
    track.style.width = trackWidth + 'px';

    // Ставим на начальную страницу без анимации
    moveToPage(currentPage, false);
  }

  // ----- Перемещение дорожки -----
  function moveToPage(page, animate = true) {
    if (totalSlides <= visibleSlides) {
      track.style.transform = 'translateX(0)';
      return;
    }
    const slideWidth = parseFloat(track.querySelector('.slide').style.width);
    const step = slideWidth + GAP;                    // шаг = слайд + отступ
    const offset = (page + visibleSlides) * step;     // +visibleSlides из-за клонов слева

    track.style.transition = animate ? 'transform 0.5s ease' : 'none';
    track.style.transform = `translateX(-${offset}px)`;
  }

  // ----- Бесшовный возврат с клонов -----
  function handleInfiniteLoop() {
    if (totalSlides <= visibleSlides) return;
    if (currentPage >= totalPages) {
      currentPage = 0;
      moveToPage(currentPage, false);
    } else if (currentPage < 0) {
      currentPage = totalPages - 1;
      moveToPage(currentPage, false);
    }
  }

  // ----- Обновление счётчика -----
  function updateCounter() {
    if (totalSlides <= visibleSlides) {
      currentPageEl.textContent = '1';
      totalPagesEl.textContent = '1';
      return;
    }
    currentPageEl.textContent = currentPage + 1;
    totalPagesEl.textContent = totalPages;
  }

  // ----- Листание -----
  function goToNext() {
    if (isTransitioning || totalSlides <= visibleSlides) return;
    isTransitioning = true;
    currentPage++;
    moveToPage(currentPage, true);
    setTimeout(() => {
      handleInfiniteLoop();
      updateCounter();
      isTransitioning = false;
    }, 500);
  }

  function goToPrev() {
    if (isTransitioning || totalSlides <= visibleSlides) return;
    isTransitioning = true;
    currentPage--;
    moveToPage(currentPage, true);
    setTimeout(() => {
      handleInfiniteLoop();
      updateCounter();
      isTransitioning = false;
    }, 500);
  }

  // ----- Автопрокрутка -----
  function startAutoPlay() {
    stopAutoPlay();
    if (totalSlides > visibleSlides) {
      autoPlayInterval = setInterval(goToNext, 4000);
    }
  }

  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }

  // ----- Ресайз -----
  function onResize() {
    const newVisible = getVisibleSlides();
    if (newVisible === visibleSlides) return;

    visibleSlides = newVisible;
    totalPages = Math.ceil(totalSlides / visibleSlides);
    currentPage = 0;

    buildInfiniteTrack();
    setSizesAndPosition();
    updateCounter();
    startAutoPlay();
  }

  // ----- Старт -----
  function init() {
    buildInfiniteTrack();
    setSizesAndPosition();
    updateCounter();
    startAutoPlay();

    nextBtn.addEventListener('click', goToNext);
    prevBtn.addEventListener('click', goToPrev);
    wrapper.addEventListener('mouseenter', stopAutoPlay);
    wrapper.addEventListener('mouseleave', startAutoPlay);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(onResize, 150);
    });
  }

  init();
});