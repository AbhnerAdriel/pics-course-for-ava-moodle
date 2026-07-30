import {toHash, unitPath} from '../core/router.js';

export function navigationShell({mode, course, unit, currentPage = 1}) {
    const items = mode === 'unit'
        ? unit.pages.map((page, index) => `
            <li><a class="menu-link${index + 1 === currentPage ? ' is-current' : ''}"
                href="${toHash(unitPath(unit.slug, index + 1))}"
                ${index + 1 === currentPage ? 'aria-current="page"' : ''}>${page.title}</a></li>`).join('')
        : course.units.map((item) => item.available
            ? `<li><a class="menu-link" href="${toHash(unitPath(item.slug, 1))}">${item.title}</a></li>`
            : `<li><span class="menu-link" aria-disabled="true">${item.title} — em breve</span></li>`).join('');

    const heading = mode === 'unit' ? unit.menuTitle : 'Unidades do Módulo';
    return `
        <div class="menu-navegacao-wrapper">
            <button id="abrir-menu-navegacao" class="menu-navegacao-botao" type="button"
                aria-label="Abrir menu de navegação" aria-expanded="false" aria-controls="menu-navegacao-lateral">
                <span class="menu-navegacao-icone" aria-hidden="true"><span></span><span></span><span></span></span>
                <span class="menu-navegacao-texto">Menu</span>
            </button>
        </div>
        <div id="menu-navegacao-backdrop" class="menu-navegacao-backdrop" hidden></div>
        <aside id="menu-navegacao-lateral" class="menu-navegacao-lateral" aria-label="Menu de navegação"
            aria-hidden="true" inert>
            <div class="menu-navegacao-cabecalho">
                <h2>Menu Navegação</h2>
                <button id="fechar-menu-navegacao" class="menu-navegacao-fechar" type="button" aria-label="Fechar menu de navegação">×</button>
            </div>
            <nav class="menu-navegacao-conteudo" aria-label="${heading}">
                ${mode === 'unit' ? `<p><a class="menu-link" href="#/">← Voltar ao módulo</a></p>` : ''}
                <section class="menu-navegacao-grupo">
                    <h3>${heading}</h3>
                    <ul>${items}</ul>
                </section>
            </nav>
        </aside>`;
}

export function bindNavigationDrawer(root = document) {
    const open = root.querySelector('#abrir-menu-navegacao');
    const close = root.querySelector('#fechar-menu-navegacao');
    const aside = root.querySelector('#menu-navegacao-lateral');
    const backdrop = root.querySelector('#menu-navegacao-backdrop');
    if (!open || !close || !aside || !backdrop) return () => {};

    let previouslyFocused = null;
    const focusables = () => [...aside.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true');

    const openDrawer = () => {
        previouslyFocused = document.activeElement;
        backdrop.hidden = false;
        aside.removeAttribute('inert');
        requestAnimationFrame(() => { backdrop.classList.add('is-visible'); aside.classList.add('is-open'); });
        aside.setAttribute('aria-hidden', 'false');
        open.setAttribute('aria-expanded', 'true');
        close.focus();
    };

    const closeDrawer = ({restoreFocus = true} = {}) => {
        backdrop.classList.remove('is-visible');
        aside.classList.remove('is-open');
        aside.setAttribute('aria-hidden', 'true');
        aside.setAttribute('inert', '');
        open.setAttribute('aria-expanded', 'false');
        setTimeout(() => { backdrop.hidden = true; }, 250);
        if (restoreFocus && previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };

    const onKey = (event) => {
        if (!aside.classList.contains('is-open')) return;
        if (event.key === 'Escape') { closeDrawer(); return; }
        if (event.key !== 'Tab') return;
        const elements = focusables();
        if (!elements.length) return;
        const first = elements[0];
        const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    const onNavigate = (event) => {
        const link = event.target.closest('a[href^="#/"]');
        if (link) closeDrawer({restoreFocus: false});
    };

    open.addEventListener('click', openDrawer);
    close.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    aside.addEventListener('click', onNavigate);
    document.addEventListener('keydown', onKey);

    return () => {
        open.removeEventListener('click', openDrawer);
        close.removeEventListener('click', closeDrawer);
        backdrop.removeEventListener('click', closeDrawer);
        aside.removeEventListener('click', onNavigate);
        document.removeEventListener('keydown', onKey);
    };
}
