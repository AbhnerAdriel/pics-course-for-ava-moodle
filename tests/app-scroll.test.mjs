import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {course, unitsBySlug} from '../assets/js/data/course.js';

// Executa o controlador real com o navegador e os componentes de conteúdo isolados.
const source = readFileSync(new URL('../assets/js/app.js', import.meta.url), 'utf8')
    .replace(/^import .+;\r?$/gm, '');

function environment() {
    const frames = new Map();
    const scrolls = [];
    const focused = [];
    const classes = new Set();
    let nextFrame = 0;
    let navigate;
    let destination = null;
    const heading = name => ({focus: options => focused.push({name, ...options})});
    const banner = heading('banner');
    const content = heading('content');
    const progress = {offsetTop: 480, offsetParent: null, isConnected: true};
    const app = {setAttribute() {}, innerHTML: ''};
    const document = {
        documentElement: {classList: {add: name => classes.add(name), remove: name => classes.delete(name)}},
        querySelector: selector => ({
            '#app': app,
            '#app-live-region': {textContent: ''},
            '#route-stylesheet': {},
            '#banner-conteudo-titulo': banner,
            '.progresso-paginas-faixa': progress,
            '#pagina-conteudo h1, #pagina-conteudo h2, #pagina-conteudo h3': content,
        })[selector] || null,
    };
    const window = {scrollY: 1200, scrollTo(options) { this.scrollY = options.top; scrolls.push({...options}); }};
    const history = {scrollRestoration: 'auto'};
    const noopBinder = () => () => {};
    const context = {
        document, window, history, course, unitsBySlug, console,
        requestAnimationFrame: callback => { const id = ++nextFrame; frames.set(id, callback); return id; },
        cancelAnimationFrame: id => frames.delete(id),
        HashRouter: class { constructor(callback) { navigate = callback; } start() {} },
        RouteStyleManager: class { async use() {} },
        ProgressStore: class { visit() { return {}; } },
        MoodleBridge: class { progressChanged() {} },
        renderUnit: ({unit, page}) => `${unit.slug}:${page}`,
        takeReadingDestination: () => { const target = destination; destination = null; return target; },
        ...Object.fromEntries([
            'enhanceUnitContent', 'bindNavigationDrawer', 'bindPageInteractions', 'bindConfiguredLinks',
            'bindBackToTop', 'bindUnitTwoTools', 'bindUnitThreeTools', 'bindUnitFourTools',
        ].map(name => [name, noopBinder])),
    };
    vm.runInNewContext(source, context);
    return {
        window, history, scrolls, focused, classes,
        navigate: (slug, page) => navigate({name: 'unit', slug, page}),
        setDestination: target => { destination = target; },
        flushFrames() {
            while (frames.size) {
                const pending = [...frames.entries()];
                frames.clear();
                pending.forEach(([, callback]) => callback());
            }
        },
    };
}

test('a primeira página de todas as unidades abre no topo e foca o banner sem deslocar a leitura', async () => {
    for (const unit of unitsBySlug.values()) {
        const browser = environment();
        await browser.navigate(unit.slug, 1);
        browser.flushFrames();
        assert.equal(browser.history.scrollRestoration, 'manual');
        assert.equal(browser.window.scrollY, 0, unit.slug);
        assert.ok(browser.scrolls.length >= 2);
        assert.ok(browser.scrolls.every(scroll => scroll.top === 0 && scroll.left === 0 && scroll.behavior === 'auto'));
        assert.deepEqual(browser.focused.at(-1), {name: 'banner', preventScroll: true});
        assert.equal(browser.classes.has('is-route-scroll-reset'), false);
    }
});

test('retornar à primeira página cancela o reposicionamento pendente da página anterior', async () => {
    const browser = environment();
    await browser.navigate('unidade-3', 2);
    assert.equal(browser.window.scrollY, 480);
    const previousScrolls = browser.scrolls.length;
    await browser.navigate('unidade-3', 1);
    browser.flushFrames();
    assert.equal(browser.window.scrollY, 0);
    assert.ok(browser.scrolls.slice(previousScrolls).every(scroll => scroll.top === 0));
    assert.deepEqual(browser.focused.at(-1), {name: 'banner', preventScroll: true});
});

test('as páginas seguintes mantêm a barra de progresso e os destinos de leitura; a primeira prioriza o topo', async () => {
    const browser = environment();
    await browser.navigate('unidade-2', 2);
    browser.flushFrames();
    assert.equal(browser.window.scrollY, 480);

    const destination = {offsetTop: 800, offsetParent: null, isConnected: true, focus() {}};
    browser.setDestination(destination);
    await browser.navigate('unidade-2', 3);
    browser.flushFrames();
    assert.equal(browser.window.scrollY, 800);

    browser.setDestination(destination);
    await browser.navigate('unidade-2', 1);
    browser.flushFrames();
    assert.equal(browser.window.scrollY, 0);
});
