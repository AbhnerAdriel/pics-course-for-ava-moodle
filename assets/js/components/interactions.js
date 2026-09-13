import {bindContentSliders} from './content-slider.js';

export function initializeDetailsGroups(root = document) {
    const groups = new Map();
    for (const details of root.querySelectorAll('details')) {
        const parent = details.parentElement;
        if (!groups.has(parent)) groups.set(parent, []);
        groups.get(parent).push(details);
    }
    for (const details of groups.values()) {
        if (details.length < 2) continue;
        details.forEach((item, index) => { item.open = index === 0; });
    }
}

export function bindPageInteractions(root = document) {
    const cleanup = [];

    initializeDetailsGroups(root);
    cleanup.push(bindContentSliders(root));

    const onClick = (event) => {
        const disabled = event.target.closest('[aria-disabled="true"]');
        if (disabled) { event.preventDefault(); return; }
        if (event.target.closest('pics-flipbook, pics-horizontal-timeline') || event.target.closest('[data-content-slider]')) return;
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

    const reveals = [...root.querySelectorAll('.banner-info-card, .unidade-card, .conteudo-texto-imagem-flex-card, .conteudo-texto-corrido, .formulario-atividade, .pics-keyfacts, .pics-callout')];
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
