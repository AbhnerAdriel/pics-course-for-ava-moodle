import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {course, unitsBySlug} from '../assets/js/data/course.js';
import {libraryArtifacts, buildLibraryArtifacts, filterLibraryArtifacts} from '../assets/js/data/library.js';
import {renderHome, bindHome} from '../assets/js/views/home-view.js';
import {libraryPage, renderLibrary, renderLibraryResults} from '../assets/js/views/library-view.js';
import {parseRoute} from '../assets/js/core/router.js';

test('a Home apresenta a biblioteca no menu e mantém o convite depois das unidades em nova aba', () => {
    const html = renderHome({course});
    const invitation = html.indexOf('<section class="biblioteca-convite"');
    assert.ok(invitation > html.indexOf('unit-conclusao-title'));
    assert.ok(invitation < html.indexOf('<footer'));
    assert.match(html, /href="#\/biblioteca" target="_blank" rel="noopener noreferrer"/);
    const menu = html.match(/<aside id="menu-navegacao-lateral"[\s\S]*?<\/aside>/)?.[0] || '';
    assert.match(menu, /<a class="menu-link" href="#\/biblioteca">Biblioteca Digital do Módulo<\/a>/);
    assert.doesNotMatch(html, /biblioteca-filtros|biblioteca-galeria/);
    assert.deepEqual(parseRoute('#/biblioteca'), {name: 'library', path: '/biblioteca'});
});

test('o atalho da Home rola até a seção da biblioteca, respeita movimento reduzido e limpa o evento', (t) => {
    const previousWindow = globalThis.window;
    t.after(() => {
        if (previousWindow === undefined) delete globalThis.window;
        else globalThis.window = previousWindow;
    });

    for (const reducedMotion of [false, true]) {
        globalThis.window = {matchMedia: () => ({matches: reducedMotion})};
        const listeners = new Map();
        const calls = [];
        const shortcut = {
            addEventListener: (name, handler) => listeners.set(name, handler),
            removeEventListener: (name, handler) => {
                assert.equal(listeners.get(name), handler);
                listeners.delete(name);
            },
        };
        const section = {scrollIntoView: options => calls.push({action: 'scroll', ...options})};
        const title = {focus: options => calls.push({action: 'focus', ...options})};
        const root = {querySelector: selector => ({
            '[data-home-library-shortcut]': shortcut,
            '#biblioteca-digital-modulo': section,
            '#biblioteca-convite-titulo': title,
        })[selector] || null};

        const cleanup = bindHome(root);
        listeners.get('click')();
        assert.deepEqual(calls, [
            {action: 'focus', preventScroll: true},
            {action: 'scroll', behavior: reducedMotion ? 'auto' : 'smooth', block: 'start'},
        ]);
        cleanup();
        assert.equal(listeners.size, 0);
    }
});

test('o catálogo inclui os PDFs, vídeos e links de leitura publicados nas unidades sem duplicar recursos', () => {
    const urls = libraryArtifacts.filter(item => item.available).map(item => item.url);
    assert.equal(new Set(urls).size, urls.length);
    assert.equal(new Set(libraryArtifacts.map(item => item.id)).size, libraryArtifacts.length);
    assert.deepEqual(new Set(libraryArtifacts.map(item => item.type)), new Set(['pdf', 'video', 'link']));
    for (const unit of unitsBySlug.values()) {
        for (const page of unit.pages) {
            // Atividades do Moodle não são materiais de leitura da biblioteca.
            const resources = page.html.replace(/<a\b[^>]*\bdata-config-link="[^"]*(?:forum|assessment|form)Url"[^>]*>/gi, '');
            const references = [...resources.matchAll(/(?:href|src)="((?:https?:\/\/|\.\/assets\/)[^"]+)"/g)]
                .map(match => match[1]).filter(url => /^https?:\/\//.test(url) || /\.pdf$/.test(url));
            for (const url of references) assert.ok(urls.includes(url), `${unit.slug}: ${url}`);
        }
    }
});

test('todo material tem imagem, nome, descrição e uma origem válida; todos os PDFs locais existem', () => {
    for (const artifact of libraryArtifacts) {
        assert.ok(artifact.title && artifact.description && artifact.unitLabel && artifact.categoryLabel && artifact.typeLabel);
        assert.ok(existsSync(new URL(`../${artifact.image.replace(/^\.\//, '')}`, import.meta.url)), artifact.image);
        assert.ok(unitsBySlug.get(artifact.unit)?.pages[artifact.page - 1], artifact.id);
        if (artifact.url.startsWith('./')) {
            const file = new URL(`../${artifact.url.slice(2)}`, import.meta.url);
            assert.equal(readFileSync(file).subarray(0, 5).toString('ascii'), '%PDF-', artifact.id);
        }
    }
});

test('os quatro filtros se combinam e a busca tolera acentos, espaços e maiúsculas', () => {
    const matches = filterLibraryArtifacts(libraryArtifacts, {query: '  POLITICA   SAUDE  ', unit: 'unidade-4', category: 'politicas', type: 'pdf'});
    assert.deepEqual(matches.map(item => item.id), ['pnps']);
    assert.deepEqual(filterLibraryArtifacts(libraryArtifacts, {query: 'meditacao', type: 'link'}).map(item => item.id), ['curso-meditacao', 'bvs-meditacao']);
    assert.equal(filterLibraryArtifacts(libraryArtifacts, {query: 'material inexistente'}).length, 0);
    assert.equal(filterLibraryArtifacts(libraryArtifacts).length, libraryArtifacts.length);
});

test('materiais pendentes ficam sem links falsos e acompanham a configuração das unidades', () => {
    const pending = libraryArtifacts.filter(item => !item.available);
    assert.equal(pending.length, 1);
    assert.ok(pending.every(item => item.url === ''));
    const configured = buildLibraryArtifacts({unitThreeDocuments: {'u3-arte-da-meditacao-goleman.pdf': 'https://example.org/meditacao.pdf'}, unitFourVideoUrl: 'https://example.org/va4.mp4'});
    assert.equal(configured.find(item => item.id === 'arte-meditacao').available, true);
    assert.equal(configured.find(item => item.id === 'video-va4').downloadable, true);
    const invalid = buildLibraryArtifacts({unitThreeDocuments: {'u3-arte-da-meditacao-goleman.pdf': 'javascript:alert(1)'}, unitFourVideoUrl: 'data:text/html,example'});
    assert.equal(invalid.find(item => item.id === 'arte-meditacao').available, false);
    assert.equal(invalid.find(item => item.id === 'video-va4').available, false);
    const html = renderLibraryResults(pending);
    assert.equal((html.match(/type="button" disabled/g) || []).length, pending.length);
    assert.doesNotMatch(html, /href=""|href="#"|data-library-download/);
});

test('paginação mantém todos os materiais acessíveis e limita páginas fora do intervalo', () => {
    const first = libraryPage(libraryArtifacts);
    assert.equal(first.items.length, 12);
    assert.equal(first.current, 1);
    const pages = Array.from({length: first.pages}, (_, index) => libraryPage(libraryArtifacts, index + 1).items).flat();
    assert.deepEqual(pages, libraryArtifacts);
    assert.equal(libraryPage(libraryArtifacts, 999).current, first.pages);
    assert.equal(libraryPage([], 999).current, 1);
    assert.equal(libraryPage(libraryArtifacts, -2).current, 1);
    assert.match(renderLibraryResults([]), /Nenhum material encontrado/);
    assert.match(renderLibraryResults([]), /data-library-reset/);
});

test('a biblioteca inicia em lista como primeira opção e diferencia downloads de arquivos e de links externos', () => {
    const html = renderLibrary({course});
    assert.match(html, /data-view="library" data-layout="list"/);
    assert.match(html, /data-library-layout="list" aria-pressed="true"/);
    assert.match(html, /data-library-layout="grid" aria-pressed="false"/);
    assert.ok(html.indexOf('data-library-layout="list"') < html.indexOf('data-library-layout="grid"'));
    assert.match(html, /role="search"/);
    assert.match(html, /role="status" aria-live="polite"/);
    assert.match(html, /name="query"/);
    assert.match(html, /name="unit"/);
    assert.match(html, /name="category"/);
    assert.match(html, /name="type"/);
    const videos = renderLibraryResults(libraryArtifacts.filter(item => item.type === 'video' && item.available));
    assert.match(videos, /Assistir vídeo/);
    assert.match(videos, /Baixar link/);
    assert.doesNotMatch(videos, /Baixar vídeo/);
    const pdfs = renderLibraryResults(libraryArtifacts.filter(item => item.type === 'pdf' && item.available));
    assert.match(pdfs, /download\s+target="_blank"/);
    assert.match(pdfs, /Baixar PDF/);
});
