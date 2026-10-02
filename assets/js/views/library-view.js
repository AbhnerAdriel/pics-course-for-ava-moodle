import {toHash, unitPath} from '../core/router.js';
import {navigationShell} from '../components/navigation-drawer.js';
import {libraryIcon} from '../components/library-icons.js';
import {artifactTypes, libraryCategories, libraryArtifacts, filterLibraryArtifacts} from '../data/library.js';

const PAGE_SIZE = 12;
const escapeText = value => String(value).replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));

function options(items) {
    return items.map(item => `<option value="${escapeText(item.id)}">${escapeText(item.label)}</option>`).join('');
}

function artifactActions(artifact) {
    if (!artifact.available) {
        return `<span class="biblioteca-card__disponibilidade">Material ainda não disponível</span>
            <button class="biblioteca-botao" type="button" disabled>Indisponível</button>`;
    }
    const label = artifact.downloadable
        ? artifact.type === 'pdf' ? 'Baixar PDF' : 'Baixar vídeo'
        : artifact.type === 'video' ? 'Assistir vídeo' : 'Acessar link';
    const icon = artifact.downloadable ? 'download' : artifact.type === 'video' ? 'video' : 'external';
    return `<a class="biblioteca-botao" href="${escapeText(artifact.url)}" ${artifact.downloadable ? 'download' : ''}
                target="_blank" rel="noopener noreferrer" aria-label="${label}: ${escapeText(artifact.title)}">${libraryIcon(icon)}${label}</a>
            ${artifact.downloadable ? '' : `<button class="biblioteca-card__salvar" type="button" data-library-download="${artifact.id}"
                title="Salvar o endereço em um arquivo de texto" aria-label="Baixar link de ${escapeText(artifact.title)} em um arquivo de texto">${libraryIcon('download')}Baixar link</button>`}`;
}

function artifactCard(artifact) {
    return `<li><article class="biblioteca-card" aria-labelledby="artifact-${artifact.id}">
        <div class="biblioteca-card__imagem">
            <img src="${escapeText(artifact.image)}" alt="" loading="lazy" decoding="async" width="640" height="360">
            <span class="biblioteca-card__tipo">${libraryIcon(artifact.type)}${artifact.typeLabel}</span>
            <span class="biblioteca-card__unidade">${artifact.unitLabel}</span>
        </div>
        <div class="biblioteca-card__conteudo">
            <span class="biblioteca-card__assunto">${artifact.categoryLabel}</span>
            <h3 id="artifact-${artifact.id}">${escapeText(artifact.title)}</h3>
            <p>${escapeText(artifact.description)}</p>
            <a class="biblioteca-card__origem" href="${toHash(unitPath(artifact.unit, artifact.page))}" target="_blank" rel="noopener noreferrer"
                aria-label="Ver ${escapeText(artifact.title)} na ${artifact.unitLabel}, página ${artifact.page}, em nova aba">Ver na unidade ${libraryIcon('arrow')}</a>
        </div>
        <div class="biblioteca-card__acoes">${artifactActions(artifact)}</div>
    </article></li>`;
}

export function libraryPage(artifacts, page = 1) {
    const pages = Math.max(1, Math.ceil(artifacts.length / PAGE_SIZE));
    const current = Math.min(pages, Math.max(1, Number.parseInt(page, 10) || 1));
    const start = (current - 1) * PAGE_SIZE;
    return {items: artifacts.slice(start, start + PAGE_SIZE), current, pages, start, end: Math.min(start + PAGE_SIZE, artifacts.length)};
}

function pagination(current, pages) {
    if (pages === 1) return '';
    return `<nav class="biblioteca-paginacao" aria-label="Páginas do acervo">
        <button type="button" data-library-page="${current - 1}" ${current === 1 ? 'disabled' : ''}>← <span>Anterior</span></button>
        <div class="biblioteca-paginacao__numeros">${Array.from({length: pages}, (_, index) => `<button type="button" data-library-page="${index + 1}"
            aria-label="Página ${index + 1}" ${index + 1 === current ? 'aria-current="page"' : ''}>${index + 1}</button>`).join('')}</div>
        <button type="button" data-library-page="${current + 1}" ${current === pages ? 'disabled' : ''}><span>Próxima</span> →</button>
    </nav>`;
}

export function renderLibraryResults(artifacts = libraryArtifacts, page = 1) {
    const {items, current, pages} = libraryPage(artifacts, page);
    if (!items.length) {
        return `<div class="biblioteca-vazio">${libraryIcon('search')}<h3>Nenhum material encontrado</h3>
            <p>Tente outro nome ou ajuste os filtros para explorar o acervo.</p>
            <button class="biblioteca-botao" type="button" data-library-reset>Limpar filtros</button></div>`;
    }
    return `<ul class="biblioteca-galeria" aria-label="Materiais do acervo">${items.map(artifactCard).join('')}</ul>${pagination(current, pages)}`;
}

export function renderLibrary({course}) {
    const units = course.units.filter(unit => libraryArtifacts.some(artifact => artifact.unit === unit.slug));
    return `<div class="route-view biblioteca-page" data-view="library" data-layout="grid">
        ${navigationShell({mode: 'library', course})}
        <header class="biblioteca-banner" aria-labelledby="biblioteca-titulo">
            <div class="biblioteca-banner__overlay" aria-hidden="true"></div>
            <div class="biblioteca-banner__interior">
                <a class="biblioteca-voltar" href="#/">← Voltar ao módulo</a>
                <img class="biblioteca-banner__logo" src="./assets/images/pnpic-main-logo.webp" width="640" height="640"
                    alt="Logotipo da Política Nacional de Práticas Integrativas e Complementares">
                <span class="biblioteca-etiqueta">Seu acervo de aprendizagem</span>
                <h1 id="biblioteca-titulo">Biblioteca Digital do Módulo</h1>
                <p>Encontre, consulte e leve com você os materiais do curso.</p>
            </div>
        </header>
        <main id="conteudo-principal" class="biblioteca-principal" tabindex="-1">
            <form class="biblioteca-filtros" role="search" aria-label="Filtrar materiais da biblioteca">
                <div class="biblioteca-filtros__cabecalho"><h2>Encontre seu material</h2>
                    <button class="biblioteca-limpar" type="button" data-library-reset hidden>Limpar filtros</button></div>
                <div class="biblioteca-filtros__campos">
                    <div class="biblioteca-campo biblioteca-campo--busca"><label for="biblioteca-busca">Buscar por nome</label>
                        <div class="biblioteca-busca">${libraryIcon('search')}<input id="biblioteca-busca" name="query" type="search"
                            placeholder="Ex.: plantas medicinais" autocomplete="off" aria-controls="biblioteca-resultados"></div></div>
                    <div class="biblioteca-campo"><label for="biblioteca-unidade">Unidade</label><select id="biblioteca-unidade" name="unit" aria-controls="biblioteca-resultados">
                        <option value="">Todas as unidades</option>${options(units.map(unit => ({id: unit.slug, label: unit.category})))}</select></div>
                    <div class="biblioteca-campo"><label for="biblioteca-assunto">Categoria / assunto</label><select id="biblioteca-assunto" name="category" aria-controls="biblioteca-resultados">
                        <option value="">Todos os assuntos</option>${options(libraryCategories)}</select></div>
                    <div class="biblioteca-campo"><label for="biblioteca-tipo">Tipo de material</label><select id="biblioteca-tipo" name="type" aria-controls="biblioteca-resultados">
                        <option value="">Todos os tipos</option>${options(artifactTypes)}</select></div>
                </div>
            </form>
            <section class="biblioteca-acervo" aria-labelledby="biblioteca-acervo-titulo">
                <div class="biblioteca-toolbar">
                    <div><h2 id="biblioteca-acervo-titulo" tabindex="-1">Explore o acervo</h2>
                        <p id="biblioteca-contagem" role="status" aria-live="polite" aria-atomic="true">${libraryArtifacts.length} materiais · Mostrando 1–12</p></div>
                    <div class="biblioteca-visualizacao" role="group" aria-label="Visualização dos materiais">
                        <button type="button" data-library-layout="grid" aria-pressed="true" aria-controls="biblioteca-resultados">${libraryIcon('grid')}<span>Cards</span></button>
                        <button type="button" data-library-layout="list" aria-pressed="false" aria-controls="biblioteca-resultados">${libraryIcon('list')}<span>Lista</span></button>
                    </div>
                </div>
                <div id="biblioteca-resultados">${renderLibraryResults()}</div>
            </section>
        </main>
        <footer id="rodape-modulo"><div id="rodape-modulo-container">
            <img src="./assets/images/instituicoes-rodape.webp" alt="Logotipos das instituições envolvidas no módulo" width="1800" height="287" loading="lazy" decoding="async">
        </div></footer>
    </div>`;
}

export function bindLibrary(root = document) {
    const library = root.querySelector('[data-view="library"]');
    if (!library) return () => {};
    const form = library.querySelector('.biblioteca-filtros');
    const results = library.querySelector('#biblioteca-resultados');
    const count = library.querySelector('#biblioteca-contagem');
    const heading = library.querySelector('#biblioteca-acervo-titulo');
    const clear = form.querySelector('[data-library-reset]');
    let currentPage = 1;
    let filtered = libraryArtifacts;
    const pendingDownloads = new Map();

    const update = () => {
        const filters = Object.fromEntries(new FormData(form));
        filtered = filterLibraryArtifacts(libraryArtifacts, filters);
        const page = libraryPage(filtered, currentPage);
        currentPage = page.current;
        results.innerHTML = renderLibraryResults(filtered, currentPage);
        const total = filtered.length;
        count.textContent = `${total} ${total === 1 ? 'material encontrado' : 'materiais encontrados'}${total ? ` · Mostrando ${page.start + 1}–${page.end}` : ''}`;
        clear.hidden = !Object.values(filters).some(Boolean);
    };
    const onFilter = () => { currentPage = 1; update(); };
    const onSubmit = event => { event.preventDefault(); onFilter(); };
    const onClick = event => {
        const layoutButton = event.target.closest('[data-library-layout]');
        if (layoutButton && library.contains(layoutButton)) {
            library.dataset.layout = layoutButton.dataset.libraryLayout;
            library.querySelectorAll('[data-library-layout]').forEach(button => button.setAttribute('aria-pressed', String(button === layoutButton)));
            return;
        }
        if (event.target.closest('[data-library-reset]')) {
            form.reset();
            onFilter();
            form.elements.query.focus({preventScroll: true});
            return;
        }
        const pageButton = event.target.closest('[data-library-page]');
        if (pageButton && !pageButton.disabled) {
            currentPage = Number(pageButton.dataset.libraryPage);
            update();
            heading.focus({preventScroll: true});
            heading.scrollIntoView({block: 'start', behavior: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
            return;
        }
        const download = event.target.closest('[data-library-download]');
        if (!download) return;
        const artifact = libraryArtifacts.find(item => item.id === download.dataset.libraryDownload);
        if (!artifact?.available) return;
        const blob = new Blob([`\uFEFF${artifact.title}\r\n${artifact.unitLabel} · ${artifact.categoryLabel}\r\n\r\n${artifact.url}\r\n`], {type: 'text/plain;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${artifact.id}-link.txt`;
        document.body.append(link);
        link.click();
        link.remove();
        const timer = setTimeout(() => { URL.revokeObjectURL(url); pendingDownloads.delete(url); }, 1000);
        pendingDownloads.set(url, timer);
    };

    form.addEventListener('input', onFilter);
    form.addEventListener('change', onFilter);
    form.addEventListener('submit', onSubmit);
    library.addEventListener('click', onClick);
    return () => {
        form.removeEventListener('input', onFilter);
        form.removeEventListener('change', onFilter);
        form.removeEventListener('submit', onSubmit);
        library.removeEventListener('click', onClick);
        pendingDownloads.forEach((timer, url) => { clearTimeout(timer); URL.revokeObjectURL(url); });
        pendingDownloads.clear();
    };
}
