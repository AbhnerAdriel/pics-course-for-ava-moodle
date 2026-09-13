import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../assets/video/js/video-component.js', import.meta.url), 'utf8');
const styles = fs.readFileSync(new URL('../assets/video/css/video-component.css', import.meta.url), 'utf8');

function classList() {
    const values = new Set();
    return {
        add: (...names) => names.forEach((name) => values.add(name)),
        contains: (name) => values.has(name),
    };
}

function section() {
    return {classList: classList()};
}

function createEnvironment({reduceMotion = false, withObserver = true} = {}) {
    const initialSection = section();
    const observers = [];
    const document = {
        readyState: 'complete',
        documentElement: {classList: classList()},
        querySelectorAll: () => [initialSection],
        addEventListener: () => {},
    };
    const window = {
        matchMedia: () => ({matches: reduceMotion}),
    };

    class FakeIntersectionObserver {
        constructor(callback, options) {
            this.callback = callback;
            this.options = options;
            this.observed = [];
            this.unobserved = [];
            this.disconnectCount = 0;
            observers.push(this);
        }

        observe(target) { this.observed.push(target); }
        unobserve(target) { this.unobserved.push(target); }
        disconnect() { this.disconnectCount += 1; }
    }

    if (withObserver) window.IntersectionObserver = FakeIntersectionObserver;
    const context = {window, document, Array, Set};
    if (withObserver) context.IntersectionObserver = FakeIntersectionObserver;
    vm.runInNewContext(source, context);
    return {window, document, initialSection, observers};
}

test('inicializa e limpa o observer do componente de vídeo em rotas SPA', () => {
    const environment = createEnvironment();
    assert.equal(environment.observers.length, 1);
    assert.deepEqual(environment.observers[0].observed, [environment.initialSection]);

    const nextSection = section();
    const root = {querySelectorAll: () => [nextSection]};
    const cleanup = environment.window.PICSVideo.init(root);

    assert.equal(environment.observers[0].disconnectCount, 1);
    assert.equal(environment.observers.length, 2);
    assert.deepEqual(environment.observers[1].observed, [nextSection]);

    environment.observers[1].callback([
        {isIntersecting: true, target: nextSection},
    ], environment.observers[1]);
    assert.equal(nextSection.classList.contains('is-visible'), true);
    assert.deepEqual(environment.observers[1].unobserved, [nextSection]);

    cleanup();
    cleanup();
    assert.equal(environment.observers[1].disconnectCount, 1);
});

test('exibe imediatamente o vídeo com movimento reduzido ou sem IntersectionObserver', () => {
    const reduced = createEnvironment({reduceMotion: true});
    assert.equal(reduced.initialSection.classList.contains('is-visible'), true);
    assert.equal(reduced.observers.length, 0);

    const fallback = createEnvironment({withObserver: false});
    assert.equal(fallback.initialSection.classList.contains('is-visible'), true);
    assert.equal(fallback.observers.length, 0);
});

test('mantém o ícone, a moldura elegante e a legenda fora da área do player', () => {
    assert.match(styles, /\.pics-video__eyebrow-icon\s*\{[\s\S]*?width:\s*52px;[\s\S]*?height:\s*52px;/);
    assert.doesNotMatch(styles, /\.pics-video__eyebrow-index\b/);
    assert.match(styles, /\.pics-video__frame\s*\{[\s\S]*?border-radius:\s*var\(--pics-video-frame-radius\);[\s\S]*?linear-gradient\(145deg,[\s\S]*?box-shadow:/);
    assert.match(styles, /\.pics-video__media-shell\s*\{[\s\S]*?overflow:\s*hidden;[\s\S]*?border-radius:\s*calc\(var\(--pics-video-frame-radius\) - 7px\);/);
    assert.match(styles, /\.pics-video__media-shell::before,\s*\.pics-video__media-shell::after\s*\{\s*content:\s*none;/);
    assert.match(styles, /\.pics-video__offset-frame\s*\{[\s\S]*?height:\s*3px;[\s\S]*?transform:\s*none;[\s\S]*?pointer-events:\s*none;/);
    assert.match(styles, /\.pics-video__media-shell:focus-within\s*\{[\s\S]*?outline:\s*4px solid var\(--pics-focus\);/);
    assert.match(styles, /\.pics-video__caption\s*\{[\s\S]*?width:\s*min\(100%,\s*980px\);[\s\S]*?margin:\s*clamp\(18px,\s*2vw,\s*24px\) auto 0;[\s\S]*?padding-inline:\s*16px;/);
    assert.match(styles, /@media \(max-width:\s*720px\)[\s\S]*?\.pics-video__caption\s*\{[\s\S]*?margin-top:\s*16px;[\s\S]*?padding-inline:\s*12px;/);
    assert.match(styles, /@media \(forced-colors:\s*active\)/);
});
