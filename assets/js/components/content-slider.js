function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function bindContentSliders(root = document) {
    const cleanups = [];
    const sliders = [...root.querySelectorAll('[data-content-slider]')];

    for (const slider of sliders) {
        const slides = [...slider.querySelectorAll('[data-content-slide]')];
        const selectors = [...slider.querySelectorAll('[data-slide-to]')];
        const previous = slider.querySelector('[data-slide-previous]');
        const next = slider.querySelector('[data-slide-next]');
        const status = slider.querySelector('[data-slide-status]');
        if (!slides.length) continue;

        let activeIndex = clamp(Number(slider.dataset.startSlide) || 0, 0, slides.length - 1);

        const showSlide = (requestedIndex, {focusSelector = false} = {}) => {
            activeIndex = clamp(requestedIndex, 0, slides.length - 1);
            slides.forEach((slide, index) => {
                const isActive = index === activeIndex;
                slide.hidden = !isActive;
                slide.setAttribute('aria-hidden', String(!isActive));
            });
            selectors.forEach((selector, index) => {
                const isActive = index === activeIndex;
                selector.setAttribute('aria-current', isActive ? 'true' : 'false');
                selector.setAttribute('aria-selected', String(isActive));
                selector.tabIndex = isActive ? 0 : -1;
            });
            if (previous) previous.disabled = activeIndex === 0;
            if (next) next.disabled = activeIndex === slides.length - 1;
            if (status) status.textContent = `${activeIndex + 1} de ${slides.length}`;
            if (focusSelector) selectors[activeIndex]?.focus();
        };

        const handleClick = (event) => {
            const selector = event.target.closest('[data-slide-to]');
            if (selector && slider.contains(selector)) {
                showSlide(Number(selector.dataset.slideTo));
                return;
            }
            if (event.target.closest('[data-slide-previous]')) showSlide(activeIndex - 1);
            if (event.target.closest('[data-slide-next]')) showSlide(activeIndex + 1);
        };

        const handleKeydown = (event) => {
            if (!event.target.closest('[data-slide-to]')) return;
            const destinations = {
                ArrowLeft: activeIndex - 1,
                ArrowRight: activeIndex + 1,
                Home: 0,
                End: slides.length - 1,
            };
            if (!(event.key in destinations)) return;
            event.preventDefault();
            showSlide(destinations[event.key], {focusSelector: true});
        };

        slider.dataset.enhanced = 'true';
        slider.addEventListener('click', handleClick);
        slider.addEventListener('keydown', handleKeydown);
        showSlide(activeIndex);

        cleanups.push(() => {
            slider.removeEventListener('click', handleClick);
            slider.removeEventListener('keydown', handleKeydown);
            delete slider.dataset.enhanced;
            slides.forEach((slide) => {
                slide.hidden = false;
                slide.removeAttribute('aria-hidden');
            });
        });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
}
