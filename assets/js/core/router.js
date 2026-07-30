const HOME_ROUTE = Object.freeze({name: 'home', path: '/'});

export function normalizeHash(hash = '') {
    const raw = String(hash).replace(/^#/, '').trim();
    if (!raw || raw === '/') return '/';
    return `/${raw.replace(/^\/+|\/+$/g, '')}`;
}

export function parseRoute(hash = '') {
    const path = normalizeHash(hash);
    if (path === '/') return {...HOME_ROUTE};

    const match = path.match(/^\/unidade\/([a-z0-9-]+)(?:\/pagina\/(\d+))?$/i);
    if (match) {
        return {
            name: 'unit',
            path,
            slug: match[1].toLowerCase(),
            page: Math.max(1, Number.parseInt(match[2] || '1', 10) || 1),
        };
    }

    return {name: 'not-found', path};
}

export function unitPath(slug, page = 1) {
    const safePage = Math.max(1, Number.parseInt(String(page), 10) || 1);
    return `/unidade/${slug}/pagina/${safePage}`;
}

export function toHash(path) {
    return `#${normalizeHash(path)}`;
}

export class HashRouter {
    #onChange;
    #boundHandle;

    constructor(onChange) {
        if (typeof onChange !== 'function') throw new TypeError('HashRouter requer uma função onChange.');
        this.#onChange = onChange;
        this.#boundHandle = () => this.#onChange(parseRoute(window.location.hash));
    }

    start() {
        window.addEventListener('hashchange', this.#boundHandle);
        if (!window.location.hash) {
            history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/`);
        }
        this.#boundHandle();
    }

    stop() { window.removeEventListener('hashchange', this.#boundHandle); }

    navigate(path, {replace = false} = {}) {
        const next = toHash(path);
        if (replace) {
            history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`);
            this.#boundHandle();
        } else if (window.location.hash === next) {
            this.#boundHandle();
        } else {
            window.location.hash = next;
        }
    }
}
