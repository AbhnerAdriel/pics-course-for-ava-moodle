import test from 'node:test';
import assert from 'node:assert/strict';

import {bindContentSliders} from '../assets/js/components/content-slider.js';

function control(kind, index = null) {
    return {
        dataset: index === null ? {} : {slideTo: String(index)},
        attributes: new Map(),
        disabled: false,
        tabIndex: 0,
        focused: false,
        setAttribute(name, value) { this.attributes.set(name, value); },
        focus() { this.focused = true; },
        closest(selector) {
            if (kind === 'selector' && selector === '[data-slide-to]') return this;
            if (kind === 'previous' && selector === '[data-slide-previous]') return this;
            if (kind === 'next' && selector === '[data-slide-next]') return this;
            return null;
        },
    };
}

test('slider de conteúdo sincroniza slides, controles e teclado', () => {
    const slides = Array.from({length: 3}, () => ({
        hidden: false,
        attributes: new Map(),
        setAttribute(name, value) { this.attributes.set(name, value); },
        removeAttribute(name) { this.attributes.delete(name); },
    }));
    const selectors = Array.from({length: 3}, (_, index) => control('selector', index));
    const previous = control('previous');
    const next = control('next');
    const status = {textContent: ''};
    const listeners = new Map();
    const slider = {
        dataset: {},
        querySelectorAll(selector) {
            if (selector === '[data-content-slide]') return slides;
            if (selector === '[data-slide-to]') return selectors;
            return [];
        },
        querySelector(selector) {
            if (selector === '[data-slide-previous]') return previous;
            if (selector === '[data-slide-next]') return next;
            if (selector === '[data-slide-status]') return status;
            return null;
        },
        addEventListener(type, handler) { listeners.set(type, handler); },
        removeEventListener(type, handler) { assert.equal(listeners.get(type), handler); },
        contains() { return true; },
    };
    const root = {querySelectorAll: () => [slider]};

    const cleanup = bindContentSliders(root);
    assert.equal(slider.dataset.enhanced, 'true');
    assert.deepEqual(slides.map((slide) => slide.hidden), [false, true, true]);
    assert.equal(previous.disabled, true);
    assert.equal(status.textContent, '1 de 3');

    listeners.get('click')({target: next});
    assert.deepEqual(slides.map((slide) => slide.hidden), [true, false, true]);
    assert.equal(status.textContent, '2 de 3');
    assert.equal(selectors[1].attributes.get('aria-current'), 'true');
    assert.equal(selectors[1].attributes.get('aria-selected'), 'true');

    let prevented = false;
    listeners.get('keydown')({target: selectors[1], key: 'End', preventDefault() { prevented = true; }});
    assert.equal(prevented, true);
    assert.equal(selectors[2].focused, true);
    assert.equal(next.disabled, true);

    cleanup();
    assert.equal(slider.dataset.enhanced, undefined);
    assert.deepEqual(slides.map((slide) => slide.hidden), [false, false, false]);
});
