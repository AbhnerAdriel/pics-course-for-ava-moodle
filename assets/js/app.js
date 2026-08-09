import {course, unitsBySlug} from './data/course.js';
import {HashRouter, unitPath} from './core/router.js';
import {ProgressStore} from './core/store.js';
import {RouteStyleManager} from './core/style-manager.js';
import {MoodleBridge} from './services/moodle-bridge.js';
import {renderHome} from './views/home-view.js';
import {renderUnit, bindConfiguredLinks} from './views/unit-view.js';
import {bindNavigationDrawer} from './components/navigation-drawer.js';
import {bindPageInteractions} from './components/interactions.js';

const app = document.querySelector('#app');
const liveRegion = document.querySelector('#app-live-region');
const styleManager = new RouteStyleManager(document.querySelector('#route-stylesheet'));
const progressStore = new ProgressStore();
const moodleBridge = new MoodleBridge();
let cleanupView = [];
let lastRoute = null;
let renderSequence = 0;
let routeScrollFrame = 0;
let routeScrollCleanupFrame = 0;

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.querySelector('#skip-to-content')?.addEventListener('click', () => {
    const target = document.querySelector('#conteudo-principal');
    if (target) { target.focus({preventScroll: true}); target.scrollIntoView({block: 'start'}); }
});

function cleanup() {
    cancelRouteScroll();
    cleanupView.forEach((fn) => {
        try { fn(); } catch (error) { console.warn(error); }
    });
    cleanupView = [];
}

function cancelRouteScroll() {
    cancelAnimationFrame(routeScrollFrame);
    cancelAnimationFrame(routeScrollCleanupFrame);
    routeScrollFrame = 0;
    routeScrollCleanupFrame = 0;
    document.documentElement.classList.remove('is-route-scroll-reset');
}

function scheduleRouteScroll(target, sequence) {
    cancelRouteScroll();
    const applyScroll = () => {
        if (sequence !== renderSequence || (target && !target.isConnected)) return false;

        const root = document.documentElement;
        root.classList.add('is-route-scroll-reset');
        let top = 0;
        for (let element = target; element; element = element.offsetParent) {
            top += element.offsetTop;
        }
        window.scrollTo({top: Math.max(0, top), left: 0, behavior: 'auto'});
        return true;
    };

    applyScroll();
    routeScrollFrame = requestAnimationFrame(() => {
        routeScrollFrame = requestAnimationFrame(() => {
            routeScrollFrame = 0;
            if (!applyScroll()) return;
            routeScrollCleanupFrame = requestAnimationFrame(() => {
                document.documentElement.classList.remove('is-route-scroll-reset');
                routeScrollCleanupFrame = 0;
            });
        });
    });
}

function announce(message) {
    liveRegion.textContent = '';
    requestAnimationFrame(() => { liveRegion.textContent = message; });
}

function notFound() {
    return `<main class="app-status"><section class="app-status-card"><h1>Página não encontrada</h1>
        <p>O endereço informado não corresponde a uma página publicada deste módulo.</p><a href="#/">Voltar ao módulo</a></section></main>`;
}

function bindCommon() {
    cleanupView.push(bindNavigationDrawer(document));
    cleanupView.push(bindPageInteractions(document));
    cleanupView.push(bindConfiguredLinks(document));
    const cleanupVideo = window.PICSVideo?.init?.(document);
    if (typeof cleanupVideo === 'function') cleanupView.push(cleanupVideo);
}

async function render(route) {
    const sequence = ++renderSequence;
    cleanup();
    app.setAttribute('aria-busy', 'true');
    const previous = lastRoute;
    lastRoute = route;

    try {
        if (route.name === 'home') {
            await styleManager.use('home');
            if (sequence !== renderSequence) return;
            document.title = course.shortTitle;
            app.innerHTML = renderHome({course});
            app.setAttribute('aria-busy', 'false');
            bindCommon();
            document.querySelector('#conteudo-principal')?.focus({preventScroll: true});
            scheduleRouteScroll(null, sequence);
            announce('Página principal do módulo carregada.');
            return;
        }

        if (route.name === 'unit') {
            const unit = unitsBySlug.get(route.slug);
            if (!unit) {
                await styleManager.use('home');
                if (sequence !== renderSequence) return;
                app.innerHTML = notFound();
                app.setAttribute('aria-busy', 'false');
                document.title = `Página não encontrada | ${course.shortTitle}`;
                announce('Página não encontrada.');
                return;
            }

            const page = Math.min(route.page, unit.pages.length);
            if (page !== route.page) {
                router.navigate(unitPath(unit.slug, page), {replace: true});
                return;
            }

            await styleManager.use('unit');
            if (sequence !== renderSequence) return;
            const pageData = unit.pages[page - 1];
            document.title = `${pageData.title} | ${unit.title} | ${course.shortTitle}`;
            app.innerHTML = renderUnit({course, unit, page});
            app.setAttribute('aria-busy', 'false');
            const unitProgress = progressStore.visit(unit.slug, page, unit.pages.length);
            moodleBridge.progressChanged({courseId: course.id, unitSlug: unit.slug, page, totalPages: unit.pages.length, ...unitProgress});
            bindCommon();

            const sameUnit = previous?.name === 'unit' && previous.slug === unit.slug;
            const target = sameUnit ? document.querySelector('#pagina-conteudo') : document.querySelector('#conteudo-principal');
            const heading = document.querySelector('#pagina-conteudo h1, #pagina-conteudo h2, #pagina-conteudo h3');
            if (heading) { heading.tabIndex = -1; heading.focus({preventScroll: true}); }
            scheduleRouteScroll(sameUnit ? target : null, sequence);
            announce(`${pageData.title}. Página ${page} de ${unit.pages.length}.`);
            return;
        }

        await styleManager.use('home');
        if (sequence !== renderSequence) return;
        app.innerHTML = notFound();
        app.setAttribute('aria-busy', 'false');
        document.title = `Página não encontrada | ${course.shortTitle}`;
        announce('Página não encontrada.');
    } catch (error) {
        console.error(error);
        app.setAttribute('aria-busy', 'false');
        app.innerHTML = `<main class="app-status"><section class="app-status-card"><h1>Não foi possível carregar o conteúdo</h1>
            <p>Atualize a página. Caso o problema continue, comunique a equipe responsável pelo curso.</p><a href="#/">Voltar ao início</a></section></main>`;
        announce('Ocorreu um erro ao carregar o conteúdo.');
    }
}

const router = new HashRouter(render);
router.start();
