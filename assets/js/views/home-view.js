import {unitsBySlug} from '../data/course.js';
import {toHash, unitPath} from '../core/router.js';
import {navigationShell} from '../components/navigation-drawer.js';
import {libraryIcon} from '../components/library-icons.js';

const bookIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M5 4.5C5 3.67 5.67 3 6.5 3H19v15.5c0 .28-.22.5-.5.5H7.25A2.25 2.25 0 0 0 5 21.25V4.5Z" />
    <path d="M5 21.25A2.25 2.25 0 0 1 7.25 19H19" /><path d="M9 7h6" /><path d="M9 10h6" />
</svg>`;

function unitCard(unit) {
    const data = unitsBySlug.get(unit.slug);
    const available = Boolean(unit.available && data);

    return `<article class="unidade-card${available ? ' unidade-card--disponivel' : ''}" role="listitem" aria-labelledby="unit-${unit.slug}-title">
        ${available ? `<a class="unidade-card-link" href="${toHash(unitPath(unit.slug, 1))}" target="_blank" rel="noopener noreferrer"
            aria-label="Acessar ${unit.title} em nova aba"></a>` : ''}
        <div class="unidade-card-imagem">
            <img src="${unit.image}" alt="" aria-hidden="true" loading="lazy" decoding="async">
            <span class="unidade-card-categoria">${unit.category}</span>
        </div>
        <div class="unidade-card-conteudo">
            <h3 id="unit-${unit.slug}-title">${unit.title}</h3>
            <p>${unit.description}</p>
            ${available ? '' : '<span class="unidade-card-status">Conteúdo em preparação</span>'}
        </div>
        ${available
            ? `<span class="unidade-card-botao" aria-hidden="true">${bookIcon}Acessar</span>`
            : `<span class="unidade-card-botao" aria-disabled="true">${bookIcon}Em breve</span>`}
    </article>`;
}

export function renderHome({course}) {
    return `<div class="route-view" data-view="home">
        ${navigationShell({mode: 'home', course})}
        <header id="banner-modulo" aria-labelledby="banner-modulo-titulo">
            <div class="dark-overlay" aria-hidden="true"></div>
            <div class="banner-biblioteca-wrapper">
                <button class="menu-navegacao-botao banner-biblioteca-botao" type="button" data-home-library-shortcut
                    aria-label="Ir para a seção Biblioteca Digital do Módulo" aria-controls="biblioteca-digital-modulo">
                    <span class="menu-navegacao-icone banner-biblioteca-icone" aria-hidden="true">${libraryIcon('library')}</span>
                    <span class="menu-navegacao-texto">Biblioteca</span>
                </button>
            </div>
            <div id="banner-modulo-box-textual">
                <img id="banner-modulo-logo" src="./assets/images/pnpic-main-logo.webp"
                    alt="Logotipo da Política Nacional de Práticas Integrativas e Complementares" width="640" height="640">
                <h1 id="banner-modulo-titulo">${course.title}</h1>
            </div>
        </header>
        <main id="conteudo-principal" tabindex="-1">
            <section id="banner-informacoes-modulo" aria-labelledby="resumo-modulo-titulo">
                <h2 id="resumo-modulo-titulo" class="visually-hidden">Resumo do módulo</h2>
                <div id="banner-informacoes-modulo-container" role="list">
                    ${course.stats.map((item, index) => `<article class="banner-info-card" role="listitem" aria-labelledby="stat-${index}">
                        <span class="banner-info-numero" aria-hidden="true">${item.number}</span>
                        <div class="banner-info-conteudo"><h3 id="stat-${index}">${item.label}</h3><p>${item.value}</p></div>
                    </article>`).join('')}
                </div>
            </section>
            <section id="unidades-modulo" aria-labelledby="unidades-modulo-titulo">
                <div id="unidades-modulo-cabecalho"><span>Unidades</span><h2 id="unidades-modulo-titulo">Unidades do Módulo</h2>
                    <p>Este módulo foi estruturado e dividido em unidades com o objetivo de promover a qualificação profissional de forma assertiva e organizada.</p>
                </div>
                <div id="unidades-modulo-lista" role="list">${course.units.map(unitCard).join('')}</div>
            </section>
            <section class="biblioteca-convite" id="biblioteca-digital-modulo" aria-labelledby="biblioteca-convite-titulo">
                <div class="biblioteca-convite__conteudo">
                    <span class="biblioteca-etiqueta">Acervo do módulo</span>
                    <h2 id="biblioteca-convite-titulo" tabindex="-1">Biblioteca Digital<br>do Módulo</h2>
                    <p>Todos os materiais, em um só lugar. Consulte os PDFs, revisite os vídeos e explore os links que acompanham sua aprendizagem.</p>
                    <ul class="biblioteca-convite__formatos" aria-label="Tipos de materiais disponíveis">
                        <li>${libraryIcon('pdf')}PDFs</li><li>${libraryIcon('video')}Vídeos</li><li>${libraryIcon('link')}Links externos</li>
                    </ul>
                    <a class="biblioteca-botao" href="#/biblioteca" target="_blank" rel="noopener noreferrer"
                        aria-label="Acessar a Biblioteca Digital do Módulo em nova aba">Acessar a biblioteca ${libraryIcon('external')}</a>
                    <span class="biblioteca-convite__nota">Abre em uma nova aba</span>
                </div>
                <div class="biblioteca-convite__imagem" aria-hidden="true">
                    <img src="./assets/images/unidades/introducao.webp" alt="" loading="lazy" decoding="async">
                    <span class="biblioteca-convite__selo">${libraryIcon('book')}Conhecimento sempre à mão</span>
                </div>
            </section>
        </main>
        <footer id="rodape-modulo"><div id="rodape-modulo-container">
            <img src="./assets/images/instituicoes-rodape.webp" alt="Logotipos das instituições envolvidas no módulo" width="1800" height="287" loading="lazy" decoding="async">
        </div></footer>
    </div>`;
}

export function bindHome(root = document) {
    const shortcut = root.querySelector('[data-home-library-shortcut]');
    const section = root.querySelector('#biblioteca-digital-modulo');
    if (!shortcut || !section) return () => {};

    const onClick = () => {
        root.querySelector('#biblioteca-convite-titulo')?.focus({preventScroll: true});
        section.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start',
        });
    };
    shortcut.addEventListener('click', onClick);
    return () => shortcut.removeEventListener('click', onClick);
}
