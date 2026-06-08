// Находим все бегущие строки на странице
const containers = document.querySelectorAll('.marquee-container');
if (!containers.length) return;

// Функция для настройки одной бегущей строки
function setupMarquee(container) {
    const content = container.querySelector('.marquee-content');
    if (!content) return;

    let animationTimeout = null;

    function updateMarqueeCopies() {
        const originalSet = content.querySelector('.marquee-set');
        if (!originalSet) return;

        // Останавливаем анимацию на время измерений
        content.style.animation = 'none';

        // Измеряем ширину одного набора
        const tempWrapper = document.createElement('div');
        tempWrapper.style.cssText = 'position: absolute; visibility: hidden; white-space: nowrap;';
        const tempSet = originalSet.cloneNode(true);
        tempWrapper.appendChild(tempSet);
        document.body.appendChild(tempWrapper);
        const setWidth = tempSet.offsetWidth;
        document.body.removeChild(tempWrapper);

        // Сколько наборов нужно, чтобы перекрыть ширину контейнера
        const containerWidth = container.offsetWidth;
        const copiesToFill = Math.ceil(containerWidth / setWidth);
        const totalCopies = copiesToFill * 2; // ровно в 2 раза больше

        // Пересобираем контент
        content.innerHTML = '';
        for (let i = 0; i < totalCopies; i++) {
            content.appendChild(originalSet.cloneNode(true));
        }

        // Запускаем анимацию заново
        if (animationTimeout) clearTimeout(animationTimeout);
        animationTimeout = setTimeout(() => {
            content.style.animation = 'scroll 25s linear infinite';
        }, 10);
    }

    // Запускаем при загрузке и при изменении размера окна
    window.addEventListener('load', updateMarqueeCopies);

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateMarqueeCopies, 150);
    });

    // Если DOM уже загружен, запускаем немедленно
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateMarqueeCopies);
    } else {
        updateMarqueeCopies();
    }
}

// Применяем для всех бегущих строк
containers.forEach(container => setupMarquee(container));