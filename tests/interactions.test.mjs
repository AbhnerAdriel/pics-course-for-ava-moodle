import test from 'node:test';
import assert from 'node:assert/strict';

import {bindPageInteractions} from '../assets/js/components/interactions.js';

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
