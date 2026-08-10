import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(
    new URL('../assets/pillar-stack/js/pillar-stack.js', import.meta.url),
    'utf8',
);
const styles = fs.readFileSync(
    new URL('../assets/pillar-stack/css/pillar-stack.css', import.meta.url),
    'utf8',
);

function fakeClassList() {
    const values = new Set();

    return {
        add: (...names) => names.forEach((name) => values.add(name)),
        remove: (...names) => names.forEach((name) => values.delete(name)),
        toggle: (name, force) => {
            const enabled = force === undefined ? !values.has(name) : Boolean(force);
            if (enabled) values.add(name); else values.delete(name);
            return enabled;
        },
        contains: (name) => values.has(name),
    };
}

function createEnvironment({reducedMotion = true, withObserver = false} = {}) {
    const registry = new Map();
    const listeners = new Map();
    const observerInstances = [];

    class FakeHTMLElement {
        constructor() {
            this.cards = [];
        }

        querySelectorAll(selector) {
            assert.equal(selector, '[data-stack-card]');
            return this.cards;
        }
    }

    class FakeIntersectionObserver {
        constructor(callback, options) {
            this.callback = callback;
            this.options = options;
            this.observed = [];
            this.unobserved = [];
            this.disconnected = false;
            observerInstances.push(this);
        }

        observe(target) { this.observed.push(target); }
        unobserve(target) { this.unobserved.push(target); }
        disconnect() { this.disconnected = true; }
    }

    const customElements = {
        define: (name, Component) => registry.set(name, Component),
        get: (name) => registry.get(name),
    };
    const window = {
        customElements,
        innerWidth: 1200,
        matchMedia: () => ({matches: reducedMotion}),
        addEventListener: (name, handler) => listeners.set(name, handler),
        removeEventListener: (name, handler) => {
            if (listeners.get(name) === handler) listeners.delete(name);
        },
        requestAnimationFrame: (callback) => {
            window.animationCallback = callback;
            return 1;
        },
        cancelAnimationFrame: () => {
            window.animationCallback = null;
        },
    };

    if (withObserver) window.IntersectionObserver = FakeIntersectionObserver;

    const context = {
        window,
        HTMLElement: FakeHTMLElement,
        IntersectionObserver: withObserver ? FakeIntersectionObserver : undefined,
    };

    vm.runInNewContext(source, context, {filename: 'pillar-stack.js'});

    return {
        Component: registry.get('pics-pillar-stack'),
        listeners,
        observerInstances,
        window,
    };
}

function makeCard(top) {
    return {
        classList: fakeClassList(),
        getBoundingClientRect: () => ({top}),
    };
}

test('registra o componente e mantém o estado sticky dos cinco cards', () => {
    const environment = createEnvironment({reducedMotion: true});
    const stack = new environment.Component();
    stack.cards = [
        makeCard(0),
        makeCard(150),
        makeCard(500),
        makeCard(600),
        makeCard(700),
    ];

    stack.connectedCallback();

    assert.equal(stack._cards.length, 5);
    assert.ok(stack._cards.every((card) => card.classList.contains('is-entered')));
    assert.equal(stack._cards[0].classList.contains('is-covered'), true);
    assert.equal(stack._cards[1].classList.contains('is-covered'), false);
    assert.equal(stack._cards[4].classList.contains('is-covered'), false);
    assert.equal(stack._stickyTopFor(4), 164);
    assert.equal(environment.listeners.has('scroll'), true);
    assert.equal(environment.listeners.has('resize'), true);

    environment.window.innerWidth = 500;
    assert.equal(stack._stickyTopFor(4), 118);

    stack.disconnectedCallback();
    assert.equal(environment.listeners.size, 0);
});

test('anima a entrada com IntersectionObserver e o desconecta ao remover o componente', () => {
    const environment = createEnvironment({reducedMotion: false, withObserver: true});
    const stack = new environment.Component();
    stack.cards = Array.from({length: 5}, (_, index) => makeCard(400 + index * 100));

    stack.connectedCallback();

    const observer = environment.observerInstances[0];
    assert.equal(observer.observed.length, 5);
    assert.deepEqual(
        {...observer.options},
        {threshold: 0.16, rootMargin: '0px 0px -12% 0px'},
    );

    observer.callback([{isIntersecting: true, target: stack.cards[0]}], observer);
    assert.equal(stack.cards[0].classList.contains('is-entered'), true);
    assert.deepEqual(observer.unobserved, [stack.cards[0]]);

    stack.disconnectedCallback();
    assert.equal(observer.disconnected, true);
});

test('preserva o empilhamento do ZIP com a paleta e a redução de movimento do curso', () => {
    assert.match(styles, /\.pillar-stack__card\s*\{[\s\S]*?position:\s*sticky/);
    assert.match(styles, /\.pillar-stack__card:nth-child\(5\)\s*\{[\s\S]*?top:\s*164px/);
    assert.match(styles, /var\(--conteudo-cor-verde-escuro,\s*#3f5130\)/);
    assert.match(styles, /var\(--conteudo-cor-dourado,\s*#735f20\)/);
    assert.match(styles, /@media \(prefers-reduced-motion:\s*reduce\)/);
    assert.doesNotMatch(styles, /#ff9200|#8a4b00|#8d4c00/i);
    assert.match(source, /customElements\.define\(ELEMENT_NAME, PicsPillarStack\)/);
    assert.match(source, /requestAnimationFrame/);
});
