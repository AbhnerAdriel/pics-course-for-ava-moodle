import {appConfig} from '../config.js';
import {toHash, unitPath} from '../core/router.js';
import {navigationShell} from '../components/navigation-drawer.js';

function progressBar({percent, page, total}) {
    const formattedPage = String(page).padStart(2, '0');
    const formattedTotal = String(total).padStart(2, '0');
    return `<div class="progresso-paginas-faixa">
        <div class="progresso-paginas-cabecalho" aria-hidden="true">
            <p class="progresso-paginas-titulo">Progresso de Leitura</p>
            <strong class="progresso-paginas-percentual">${percent}%</strong>
        </div>
        <div class="progresso-paginas-trilho" role="progressbar" aria-label="Progresso de Leitura"
            aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"
            aria-valuetext="${percent}% concluído. Página ${page} de ${total}.">
            <span class="progresso-paginas-valor" style="width: ${percent}%"></span>
        </div>
        <p class="progresso-paginas-indicador" aria-hidden="true">Página ${formattedPage} de ${formattedTotal}</p>
    </div>`;
}

function pagination(unit, page) {
    const total = unit.pages.length;
    const previous = Math.max(1, page - 1);
    const next = Math.min(total, page + 1);
    return `<nav class="paginacao-container" aria-label="Paginação de ${unit.title}">
        <div class="paginacao-botoes">
            <a class="paginacao-botao${page === 1 ? ' is-disabled' : ''}" ${page === 1 ? 'aria-disabled="true" tabindex="-1"' : ''}
                href="${toHash(unitPath(unit.slug, previous))}" aria-label="Retornar para a página ${previous}"><span class="paginacao-icone" aria-hidden="true">←</span><span>Retornar</span></a>
            <p class="paginacao-indicador" aria-live="polite">Página ${page} de ${total}</p>
            <a class="paginacao-botao paginacao-botao-proximo${page === total ? ' is-disabled' : ''}" ${page === total ? 'aria-disabled="true" tabindex="-1"' : ''}
                href="${toHash(unitPath(unit.slug, next))}" aria-label="Avançar para a página ${next}"><span class="paginacao-icone" aria-hidden="true">→</span><span>Avançar</span></a>
        </div>
        <div class="paginacao-numeros" aria-label="Selecionar página">${unit.pages.map((item, index) => {
            const number = index + 1;
            return `<a class="paginacao-numero${number === page ? ' is-active' : ''}" href="${toHash(unitPath(unit.slug, number))}"
                aria-label="Ir para a página ${number}: ${item.title}" ${number === page ? 'aria-current="page"' : ''}>${number}</a>`;
        }).join('')}</div>
    </nav>`;
}

function backToTopButton() {
    return `<button class="voltar-ao-topo" type="button" data-back-to-top aria-label="Voltar ao topo da página">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5m-7 7 7-7 7 7"/></svg>
        <span>Voltar ao topo</span>
    </button>`;
}

export function renderUnit({course, unit, page}) {
    const safePage = Math.min(Math.max(1, page), unit.pages.length);
    const pageData = unit.pages[safePage - 1];
    const percent = Math.round((safePage / unit.pages.length) * 100);
    // O flipbook mantém sua composição e seus estilos próprios, inclusive a abertura.
    const contentDesign = /<pics-flipbook\b/i.test(pageData.html) ? '' : ' data-content-design="editorial"';
    return `<div class="route-view" data-view="unit" data-unit="${unit.slug}" data-page="${safePage}">
        ${navigationShell({mode: 'unit', course, unit, currentPage: safePage})}
        <header id="banner-conteudo" aria-labelledby="banner-conteudo-titulo">
            <div class="dark-overlay" aria-hidden="true"></div>
            <div class="voltar-modulo-wrapper"><a class="voltar-modulo-link" href="#/" aria-label="Voltar para a página do módulo">← <span>Voltar ao módulo</span></a></div>
            <div id="banner-conteudo-box-textual">
                <img id="banner-conteudo-logo" src="./assets/images/pnpic-main-logo.webp" alt="Logotipo da Política Nacional de Práticas Integrativas e Complementares" width="640" height="640">
                <h1 id="banner-conteudo-titulo" tabindex="-1"><span id="banner-conteudo-titulo-unidade">${unit.bannerTitle}</span>${unit.bannerSubtitle}</h1>
            </div>
        </header>
        <main id="conteudo-principal" tabindex="-1">
            ${progressBar({percent, page: safePage, total: unit.pages.length})}
            <section id="conteudo-unidade" aria-labelledby="conteudo-unidade-titulo">
                <h2 id="conteudo-unidade-titulo" class="visually-hidden">${unit.title}</h2>
                <article id="pagina-conteudo" class="pagina-conteudo ${pageData.className}"${contentDesign} aria-live="polite" aria-label="${pageData.title}">${pageData.html}</article>
                ${pagination(unit, safePage)}
                ${backToTopButton()}
            </section>
        </main>
        <footer id="rodape-conteudo"><div id="rodape-conteudo-container">
            <img src="./assets/images/instituicoes-rodape.webp" alt="Logotipos das instituições envolvidas no módulo" width="1800" height="287" loading="lazy" decoding="async">
        </div></footer>
    </div>`;
}

export function bindBackToTop(root = document) {
    const button = root.querySelector('[data-back-to-top]');
    if (!button) return () => {};
    const onClick = () => {
        root.querySelector('#banner-conteudo-titulo')?.focus({preventScroll: true});
        window.scrollTo({top: 0, left: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    };
    button.addEventListener('click', onClick);
    return () => button.removeEventListener('click', onClick);
}

export function bindConfiguredLinks(root = document) {
    const links = [...root.querySelectorAll('[data-config-link]')];
    const handlers = [];
    for (const link of links) {
        const key = link.dataset.configLink;
        const url = appConfig[key] || appConfig[link.dataset.configFallback];
        if (url) {
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        } else {
            link.setAttribute('aria-disabled', 'true');
            link.title = 'Link ainda não configurado.';
            const handler = (event) => event.preventDefault();
            link.addEventListener('click', handler);
            handlers.push(() => link.removeEventListener('click', handler));
        }
    }
    return () => handlers.forEach((fn) => fn());
}
