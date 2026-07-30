export function bindPageInteractions(root = document) {
    const cleanup = [];

    const onClick = (event) => {
        const disabled = event.target.closest('[aria-disabled="true"]');
        if (disabled) { event.preventDefault(); return; }
        const button = event.target.closest('button, .unidade-card-botao, .formulario-atividade-botao');
        if (!button) return;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'efeito-ripple';
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        button.style.position ||= 'relative';
        button.style.overflow ||= 'hidden';
        button.append(ripple);
        ripple.addEventListener('animationend', () => ripple.remove(), {once: true});
    };
    root.addEventListener('click', onClick);
    cleanup.push(() => root.removeEventListener('click', onClick));

    const reveals = [...root.querySelectorAll('.banner-info-card, .unidade-card, .conteudo-texto-imagem-flex-card, .conteudo-texto-corrido, .formulario-atividade')];
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        }, {threshold: 0.08, rootMargin: '0px 0px -30px'});
        reveals.forEach((item) => { item.classList.add('js-reveal'); observer.observe(item); });
        cleanup.push(() => observer.disconnect());
    } else {
        reveals.forEach((item) => item.classList.add('is-visible'));
    }

    return () => cleanup.forEach((fn) => fn());
}

export function bindScrollProgress(element) {
    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const percent = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
        element.style.setProperty('--scroll-progress', `${percent}%`);
    };
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update, {passive: true});
    update();
    return () => {
        window.removeEventListener('scroll', update);
        window.removeEventListener('resize', update);
    };
}
