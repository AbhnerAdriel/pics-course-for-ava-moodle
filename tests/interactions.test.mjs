import test from 'node:test';
import assert from 'node:assert/strict';

import {bindPageInteractions} from '../assets/js/components/interactions.js';

test('mantém a coluna de leitura visível enquanto as animações dos blocos menores aguardam o observador', () => {
    const element = className => {
        const classes = new Set([className]);
        return {classList: {add: name => classes.add(name), contains: name => classes.has(name)}};
    };
    const reading = element('conteudo-texto-corrido');
    const card = element('pics-callout');
    const elements = [reading, card];
    const root = {
        querySelectorAll: selector => elements.filter(item => selector.split(',').some(part => item.classList.contains(part.trim().slice(1)))),
        addEventListener() {},
        removeEventListener() {},
    };
    let observer;
    class Observer {
        constructor(callback) { this.callback = callback; this.observed = []; observer = this; }
        observe(target) { this.observed.push(target); }
        unobserve(target) { this.observed = this.observed.filter(item => item !== target); }
        disconnect() { this.disconnected = true; }
    }
    const saved = Object.fromEntries(['window', 'IntersectionObserver', 'matchMedia'].map(key => [key, globalThis[key]]));
    globalThis.window = {IntersectionObserver: Observer};
    globalThis.IntersectionObserver = Observer;
    globalThis.matchMedia = () => ({matches: false});
    let cleanup;
    try {
        cleanup = bindPageInteractions(root);
        assert.equal(reading.classList.contains('js-reveal'), false);
        assert.deepEqual(observer.observed, [card]);
        assert.equal(card.classList.contains('js-reveal'), true);
        observer.callback([{isIntersecting: true, target: card}]);
        assert.equal(card.classList.contains('is-visible'), true);
        assert.equal(reading.classList.contains('js-reveal'), false);
        cleanup();
        cleanup = null;
        assert.equal(observer.disconnected, true);
    } finally {
        cleanup?.();
        for (const [key, value] of Object.entries(saved)) {
            if (value === undefined) delete globalThis[key]; else globalThis[key] = value;
        }
    }
});

test('o efeito global de clique não altera os controles da timeline', () => {
    let clickHandler = null;
    let removedHandler = null;
    let buttonLookupCount = 0;
    const timeline = {};
    const root = {
        addEventListener(type, handler) {
            if (type === 'click') clickHandler = handler;
        },
        removeEventListener(type, handler) {
            if (type === 'click') removedHandler = handler;
        },
        querySelectorAll() {
            return [];
        },
    };
    const target = {
        closest(selector) {
            if (selector === '[aria-disabled="true"]') return null;
            if (selector === 'pics-flipbook, pics-horizontal-timeline') return timeline;
            if (selector.includes('button')) buttonLookupCount += 1;
            return null;
        },
    };

    const previousWindow = globalThis.window;
    globalThis.window = {};

    try {
        const cleanup = bindPageInteractions(root);

        assert.equal(typeof clickHandler, 'function');
        clickHandler({target, preventDefault: () => assert.fail('clique válido')});
        assert.equal(buttonLookupCount, 0);

        cleanup();
        assert.equal(removedHandler, clickHandler);
    } finally {
        if (previousWindow === undefined) delete globalThis.window;
        else globalThis.window = previousWindow;
    }
});
