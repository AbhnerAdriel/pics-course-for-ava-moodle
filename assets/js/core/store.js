import {appConfig} from '../config.js';

function defaultState() {
    return {version: 1, units: {}, updatedAt: null};
}

function uniquePages(values) {
    return [...new Set(values.map(Number).filter(Number.isInteger).filter((n) => n > 0))].sort((a, b) => a - b);
}

function defaultStorageKey() {
    const pathname = globalThis.location?.pathname || 'default';
    const scope = appConfig.instanceId || pathname;
    return `${appConfig.storageKey}:${scope}`;
}

export class ProgressStore {
    #storage;
    #key;
    #state;

    constructor({storage = globalThis.localStorage, key = defaultStorageKey()} = {}) {
        this.#storage = storage;
        this.#key = key;
        this.#state = this.#read();
    }

    #read() {
        try {
            const value = this.#storage?.getItem(this.#key);
            if (!value) return defaultState();
            const parsed = JSON.parse(value);
            return parsed && parsed.version === 1 ? {...defaultState(), ...parsed, units: parsed.units || {}} : defaultState();
        } catch {
            return defaultState();
        }
    }

    #write() {
        this.#state.updatedAt = new Date().toISOString();
        try { this.#storage?.setItem(this.#key, JSON.stringify(this.#state)); } catch { /* armazenamento pode estar bloqueado */ }
    }

    snapshot() { return structuredClone(this.#state); }

    getUnit(slug) {
        const unit = this.#state.units[slug] || {};
        return {
            visitedPages: uniquePages(unit.visitedPages || []),
            completed: Boolean(unit.completed),
            updatedAt: unit.updatedAt || null,
        };
    }

    visit(slug, page, totalPages) {
        const current = this.getUnit(slug);
        const safePage = Math.min(Math.max(1, Number(page) || 1), Math.max(1, Number(totalPages) || 1));
        const visitedPages = uniquePages([...current.visitedPages, safePage]);
        const completed = visitedPages.length >= totalPages;
        const next = {visitedPages, completed, updatedAt: new Date().toISOString()};
        this.#state.units[slug] = next;
        this.#write();
        return structuredClone(next);
    }

}
