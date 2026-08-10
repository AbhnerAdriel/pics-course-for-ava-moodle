import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

import {unitOne} from '../assets/js/data/units/unidade-1.js';

const source = fs.readFileSync(
    new URL('../assets/horizontal-timeline/js/horizontal-timeline.js', import.meta.url),
    'utf8',
);
const styles = fs.readFileSync(
    new URL('../assets/horizontal-timeline/css/horizontal-timeline.css', import.meta.url),
    'utf8',
);

function fakeClassList() {
    const values = new Set();

    return {
        add: (...names) => names.forEach((name) => values.add(name)),
        remove: (...names) => names.forEach((name) => values.delete(name)),
        contains: (name) => values.has(name),
    };
}

class FakeElement {
    constructor(tagName = 'div') {
        this.tagName = tagName.toUpperCase();
        this.attributes = new Map();
        this.classList = fakeClassList();
        this.style = {};
        this.children = [];
        this.parentElement = null;
        this.hidden = false;
        this.focusCalls = [];
        this.rect = {width: 80, height: 96};
    }

    setAttribute(name, value) {
        this.attributes.set(name, String(value));
    }

    getAttribute(name) {
        return this.attributes.has(name) ? this.attributes.get(name) : null;
    }

    hasAttribute(name) {
        return this.attributes.has(name);
    }

    removeAttribute(name) {
        this.attributes.delete(name);
    }

    toggleAttribute(name, force) {
        const shouldExist = force === undefined ? !this.hasAttribute(name) : Boolean(force);

        if (shouldExist) this.setAttribute(name, '');
        else this.removeAttribute(name);

        return shouldExist;
    }

    append(...children) {
        for (const child of children) {
            child.remove();
            child.parentElement = this;
            this.children.push(child);
        }
    }

    before(sibling) {
        if (!this.parentElement) return;

        sibling.remove();
        const index = this.parentElement.children.indexOf(this);
        sibling.parentElement = this.parentElement;
        this.parentElement.children.splice(index, 0, sibling);
    }

    remove() {
        if (!this.parentElement) return;

        const index = this.parentElement.children.indexOf(this);
        if (index >= 0) this.parentElement.children.splice(index, 1);
        this.parentElement = null;
    }

    addEventListener() {}

    removeEventListener() {}

    querySelector() {
        return null;
    }

    closest() {
        return this;
    }

    contains(candidate) {
        return candidate === this || this.children.some((child) => child.contains(candidate));
    }

    getBoundingClientRect() {
        return this.rect;
    }

    focus(options) {
        this.focusCalls.push(options);
    }
}

class FakeHTMLElement extends FakeElement {}

function loadComponent() {
    const definitions = [];
    const registry = new Map();
    const cancelledFrames = [];
    const customElements = {
        define(name, constructor) {
            definitions.push([name, constructor]);
            registry.set(name, constructor);
        },
        get: (name) => registry.get(name),
    };
    const window = {
        customElements,
        matchMedia: () => ({matches: true}),
        setTimeout,
        addEventListener: () => {},
    };
    class FakeMutationObserver {
        constructor(callback) {
            this.callback = callback;
            this.observed = [];
            this.disconnectCount = 0;
        }

        observe(target, options) {
            this.observed.push([target, options]);
        }

        disconnect() {
            this.disconnectCount += 1;
        }
    }
    const context = {
        window,
        document: {
            activeElement: null,
            readyState: 'complete',
            createElement: (tagName) => new FakeElement(tagName),
            addEventListener: () => {},
        },
        HTMLElement: FakeHTMLElement,
        Element: FakeElement,
        MutationObserver: FakeMutationObserver,
        AbortController,
        Array,
        Boolean,
        Math,
        Number,
        String,
        clearTimeout,
        requestAnimationFrame: () => 1,
        cancelAnimationFrame: (frame) => cancelledFrames.push(frame),
    };

    vm.runInNewContext(source, context, {filename: 'horizontal-timeline.js'});

    return {
        Component: registry.get('pics-horizontal-timeline'),
        cancelledFrames,
        context,
        definitions,
    };
}

function panel() {
    return new FakeElement();
}

function tab(index) {
    const element = new FakeElement();
    element.setAttribute('data-timeline-index', index);
    return element;
}

function splitSelectorList(selectorList) {
    const selectors = [];
    let depth = 0;
    let start = 0;

    for (let index = 0; index < selectorList.length; index += 1) {
        const character = selectorList[index];

        if (character === '(' || character === '[') depth += 1;
        else if (character === ')' || character === ']') depth -= 1;
        else if (character === ',' && depth === 0) {
            selectors.push(selectorList.slice(start, index));
            start = index + 1;
        }
    }

    selectors.push(selectorList.slice(start));
    return selectors.map((selector) => selector.trim()).filter(Boolean);
}

function styleSelectors(css) {
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const selectors = [];

    for (const match of withoutComments.matchAll(/([^{}]+)\{/g)) {
        const prelude = match[1].trim();

        if (
            prelude.startsWith('@') ||
            /^(?:from|to|\d+(?:\.\d+)?%)$/.test(prelude)
        ) continue;

        selectors.push(...splitSelectorList(prelude));
    }

    return selectors;
}

test('registra o custom element uma única vez e não depende de jQuery ou CDN', () => {
    const environment = loadComponent();

    assert.equal(typeof environment.Component, 'function');
    assert.deepEqual(
        environment.definitions.map(([name]) => name),
        ['pics-horizontal-timeline'],
    );

    vm.runInNewContext(source, environment.context, {filename: 'horizontal-timeline.js'});
    assert.equal(environment.definitions.length, 1);
    assert.doesNotMatch(source, /\bjQuery\b|(?:^|[^\w$])\$\s*\(/m);
    assert.doesNotMatch(source, /https?:\/\//);
    assert.doesNotMatch(source, /document\.(?:querySelector|querySelectorAll)\s*\(/);
});

test('aprimora a lista semântica com tablist, tabs e painéis ARIA', () => {
    const {Component} = loadComponent();
    const timeline = new Component();
    const events = new FakeElement('ol');
    const items = ['1978', '1986', '2006'].map((label) => {
        const item = new FakeElement('li');
        item.setAttribute('data-timeline-event', '');
        item.setAttribute('data-label', label);
        return item;
    });

    events.classList.add('pics-horizontal-timeline__events');
    events.append(...items);
    timeline.append(events);
    timeline.connectedCallback();

    assert.equal(timeline.getAttribute('role'), 'region');
    assert.equal(timeline.hasAttribute('data-timeline-enhanced'), true);
    assert.equal(timeline.children[0], timeline._ui);
    assert.equal(timeline.children[1], events);
    assert.equal(events.getAttribute('role'), 'presentation');
    assert.equal(timeline._rail.getAttribute('role'), 'tablist');
    assert.equal(timeline._rail.getAttribute('aria-orientation'), 'horizontal');
    assert.equal(timeline._tabs.length, 3);

    for (const [index, item] of items.entries()) {
        const tabElement = timeline._tabs[index];
        const isSelected = index === 0;

        assert.equal(item.getAttribute('role'), 'tabpanel');
        assert.equal(item.getAttribute('aria-labelledby'), tabElement.id);
        assert.equal(item.getAttribute('aria-hidden'), String(!isSelected));
        assert.equal(item.hidden, !isSelected);
        assert.equal(item.hasAttribute('inert'), !isSelected);
        assert.equal(tabElement.getAttribute('role'), 'tab');
        assert.equal(tabElement.getAttribute('aria-controls'), item.id);
        assert.equal(tabElement.getAttribute('aria-selected'), String(isSelected));
        assert.equal(tabElement.getAttribute('tabindex'), isSelected ? '0' : '-1');
        assert.equal(tabElement.getAttribute('aria-posinset'), String(index + 1));
        assert.equal(tabElement.getAttribute('aria-setsize'), '3');
        assert.equal(tabElement.textContent, item.getAttribute('data-label'));
    }

    timeline.disconnectedCallback();
});

test('mantém seleção, painéis e tabs sincronizados pelo contrato ARIA', () => {
    const {Component} = loadComponent();
    const timeline = new Component();
    const panels = [panel(), panel(), panel()];
    const tabs = [tab(0), tab(1), tab(2)];

    timeline._connected = true;
    timeline._events = new FakeElement();
    timeline._events.rect.height = 120;
    timeline._items = panels;
    timeline._tabs = tabs;
    timeline._selectedIndex = 0;
    timeline._selectedItem = panels[0];
    timeline._fill = new FakeElement();
    timeline._viewport = {clientWidth: 420};
    timeline._rail = {style: {}};
    timeline._positions = [50, 160, 270];
    timeline._totalWidth = 320;

    panels[0].toggleAttribute('data-timeline-selected', true);
    panels[0].setAttribute('aria-hidden', 'false');
    panels[1].hidden = true;
    panels[1].setAttribute('inert', '');
    tabs[0].setAttribute('aria-selected', 'true');
    tabs[0].setAttribute('tabindex', '0');

    timeline._selectIndex(1, {focusTab: true});

    assert.equal(timeline._selectedIndex, 1);
    assert.equal(timeline._selectedItem, panels[1]);
    assert.equal(panels[0].hidden, true);
    assert.equal(panels[0].getAttribute('aria-hidden'), 'true');
    assert.equal(panels[0].hasAttribute('inert'), true);
    assert.equal(panels[0].hasAttribute('data-timeline-selected'), false);
    assert.equal(panels[1].hidden, false);
    assert.equal(panels[1].getAttribute('aria-hidden'), 'false');
    assert.equal(panels[1].hasAttribute('inert'), false);
    assert.equal(panels[1].hasAttribute('data-timeline-selected'), true);
    assert.equal(tabs[0].getAttribute('aria-selected'), 'false');
    assert.equal(tabs[0].getAttribute('tabindex'), '-1');
    assert.equal(tabs[1].getAttribute('aria-selected'), 'true');
    assert.equal(tabs[1].getAttribute('tabindex'), '0');
    assert.equal(tabs[0].hasAttribute('data-timeline-past'), true);
    assert.equal(tabs[1].focusCalls.length, 1);
    assert.equal(tabs[1].focusCalls[0].preventScroll, true);
    assert.match(timeline._fill.style.transform, /^scaleX\(0\.5\)$/);
});

test('oferece navegação de tabs por setas, Home e End', () => {
    const {Component} = loadComponent();
    const timeline = new Component();
    const target = tab(1);
    const selections = [];

    timeline._items = [{}, {}, {}, {}];
    timeline._rail = {contains: (candidate) => candidate === target};
    timeline._selectIndex = (index, options) => selections.push([index, options]);

    for (const [key, expectedIndex] of [
        ['ArrowLeft', 0],
        ['ArrowUp', 0],
        ['ArrowRight', 2],
        ['ArrowDown', 2],
        ['Home', 0],
        ['End', 3],
    ]) {
        let prevented = false;
        timeline._handleTabKeydown({
            key,
            target,
            preventDefault: () => { prevented = true; },
        });

        assert.equal(prevented, true, `${key} deve impedir a rolagem padrão`);
        const [selectedIndex, options] = selections.pop();
        assert.equal(selectedIndex, expectedIndex);
        assert.equal(options.focusTab, true);
    }

    timeline._handleTabKeydown({
        key: 'Enter',
        target,
        preventDefault: () => assert.fail('Enter não deve ser interceptado'),
    });
    assert.equal(selections.length, 0);
});

test('desconecta listeners, observers, transição e frames ao sair da rota', () => {
    const {Component, cancelledFrames} = loadComponent();
    const timeline = new Component();
    const calls = {abort: 0, mutation: 0, resize: 0, transition: 0};

    timeline._connected = true;
    timeline._boundForConnection = true;
    timeline._pointerStart = {id: 7, x: 10, y: 20};
    timeline._layoutFrame = 31;
    timeline._refreshFrame = 47;
    timeline._listenerController = {abort: () => { calls.abort += 1; }};
    timeline._mutationObserver = {disconnect: () => { calls.mutation += 1; }};
    timeline._resizeObserver = {disconnect: () => { calls.resize += 1; }};
    timeline._activeTransitionFinish = () => { calls.transition += 1; };

    timeline.disconnectedCallback();

    assert.deepEqual(calls, {abort: 1, mutation: 1, resize: 1, transition: 1});
    assert.deepEqual(cancelledFrames, [31, 47]);
    assert.equal(timeline._connected, false);
    assert.equal(timeline._boundForConnection, false);
    assert.equal(timeline._pointerStart, null);
    assert.equal(timeline._listenerController, null);
    assert.equal(timeline._mutationObserver, null);
    assert.equal(timeline._resizeObserver, null);
    assert.equal(timeline._layoutFrame, 0);
    assert.equal(timeline._refreshFrame, 0);
    assert.equal(timeline._activeTransitionFinish, null);
});

test('a página 4 fornece a lista semântica exigida pelo componente', () => {
    const html = unitOne.pages[3].html;
    const timeline = html.match(/<pics-horizontal-timeline\b[\s\S]*?<\/pics-horizontal-timeline>/)?.[0] || '';
    const events = [...timeline.matchAll(/<li\s+data-timeline-event\b[^>]*>[\s\S]*?<\/li>/g)];

    assert.match(timeline, /aria-labelledby="unidade-1-pagina-4-linha-do-tempo-titulo"/);
    assert.match(timeline, /aria-describedby="unidade-1-pagina-4-linha-do-tempo-descricao"/);
    assert.match(timeline, /<ol class="pics-horizontal-timeline__events">/);
    assert.equal(events.length, 9);

    for (const [index, event] of events.entries()) {
        const markup = event[0];

        assert.match(markup, /data-label="[^"]+"/, `rótulo ausente no evento ${index + 1}`);
        assert.match(markup, /<article>[\s\S]*<time\b[^>]*>[^<]+<\/time>/, `data ausente no evento ${index + 1}`);
        assert.match(markup, /<h3>[^<]+<\/h3>/, `título ausente no evento ${index + 1}`);
        assert.match(markup, /<p>[\s\S]+<\/p>/, `descrição ausente no evento ${index + 1}`);
    }

    assert.doesNotMatch(timeline, /<script\b|\bonclick\s*=/i);
});

test('mantém todos os seletores CSS encapsulados no custom element', () => {
    const selectors = styleSelectors(styles);
    const globalSelectors = selectors.filter(
        (selector) => !selector.includes('pics-horizontal-timeline'),
    );

    assert.ok(selectors.length > 20, 'folha do componente parece incompleta');
    assert.deepEqual(globalSelectors, []);
    assert.match(styles, />\s*article\s*>\s*:is\(h2,\s*h3\)/);
    assert.match(styles, />\s*article\s*>\s*:is\(time,\s*em\)/);
    assert.match(styles, /@media \(prefers-reduced-motion:\s*reduce\)/);
    assert.match(styles, /@media \(forced-colors:\s*active\)/);
});
