import test from 'node:test';
import assert from 'node:assert/strict';
import {bindUnitFourTools, evaluateUnitFourMatches} from '../assets/js/components/unit-four-tools.js';
import {unitFourMessages} from '../assets/js/data/units/unidade-4-interactions.js';

class Element {
    constructor(kind = '', dataset = {}) {
        this.kind = kind;
        this.dataset = {...dataset};
        this.attributes = new Map();
        this.listeners = new Map();
        this.hidden = false;
        this.disabled = false;
        this.checked = false;
        this.required = false;
        this.textContent = '';
    }
    get innerHTML() { return this.textContent; }
    set innerHTML(value) { this.textContent = value; }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    setAttribute(name, value) {
        this.attributes.set(name, String(value));
        if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = String(value);
    }
    removeAttribute(name) {
        this.attributes.delete(name);
        if (name.startsWith('data-')) delete this.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())];
    }
    addEventListener(type, handler) { this.listeners.set(type, handler); }
    removeEventListener(type, handler) { if (this.listeners.get(type) === handler) this.listeners.delete(type); }
    focus() { this.focused = true; }
    closest(selector) {
        if (selector === 'button[data-matching-term]' && this.kind === 'term') return this;
        if (selector === 'button[data-matching-target]' && this.kind === 'target') return this;
        if (selector === '[data-matching-reset]' && this.kind === 'matching-reset') return this;
        if (selector === 'label') return this.label || null;
        return null;
    }
    emit(type, detail = {}) {
        const event = {target: this, preventDefault() { this.defaultPrevented = true; }, ...detail};
        this.listeners.get(type)?.(event);
        return event;
    }
}

function matchingFixture() {
    const terms = Array.from({length: 4}, (_, index) => new Element('term', {matchingTerm: `t${index + 1}`}));
    const targets = Array.from({length: 4}, (_, index) => {
        const target = new Element('target', {matchingTarget: `p${index + 1}`});
        target.label = new Element();
        target.label.textContent = '(arraste aqui)';
        target.querySelector = () => target.label;
        return target;
    });
    const progress = new Element();
    progress.textContent = '0 / 4 corretos';
    const result = new Element();
    result.hidden = true;
    const reset = new Element('matching-reset');
    const activity = new Element();
    activity.querySelectorAll = (selector) => selector === 'button[data-matching-term]' ? terms : selector === 'button[data-matching-target]' ? targets : [];
    activity.querySelector = (selector) => ({'[data-matching-progress]': progress, '[data-matching-result]': result, '[data-matching-reset]': reset})[selector] || null;
    activity.contains = (node) => [...terms, ...targets, reset].includes(node);
    const unit = {querySelectorAll: (selector) => selector === '[data-unit-four-matching]' ? [activity] : []};
    const root = {querySelector: (selector) => selector === '[data-unit="unidade-4"]' ? unit : null};
    const pair = (term, target) => {
        activity.emit('click', {target: terms[term]});
        activity.emit('click', {target: targets[target]});
    };
    return {root, activity, terms, targets, progress, result, reset, pair};
}



test('avalia pares corretos, parciais e incorretos sem aceitar identificadores desconhecidos', () => {
    for (const matches of [null, [], {p5: 't1'}, {p1: 't5'}]) assert.equal(evaluateUnitFourMatches(matches), null);
    assert.deepEqual(evaluateUnitFourMatches({p1: 't1'}), {correct: [true, false, false, false], correctCount: 1, total: 4, complete: false, allCorrect: false});
    assert.deepEqual(evaluateUnitFourMatches({p1: 't1', p2: 't2', p3: 't3', p4: 't4'}), {correct: [true, true, true, true], correctCount: 4, total: 4, complete: true, allCorrect: true});
    assert.deepEqual(evaluateUnitFourMatches({p1: 't1', p2: 't3', p3: 't2', p4: 't4'}), {correct: [true, false, false, true], correctCount: 2, total: 4, complete: true, allCorrect: false});
});

test('associação por botões anuncia progresso, permite revisar pares e não duplica um termo', () => {
    const fixture = matchingFixture();
    const cleanup = bindUnitFourTools(fixture.root);
    fixture.activity.emit('click', {target: fixture.terms[0]});
    assert.equal(fixture.terms[0].getAttribute('aria-pressed'), 'true');
    fixture.activity.emit('keydown', {key: 'Escape'});
    assert.equal(fixture.terms[0].getAttribute('aria-pressed'), 'false');
    fixture.pair(0, 0);
    fixture.pair(1, 2);
    fixture.pair(2, 1);
    fixture.pair(3, 3);
    assert.equal(fixture.progress.textContent, '2 / 4 corretos');
    assert.equal(fixture.targets[0].getAttribute('aria-label'), 'Pedagógica — Informar, orientar e promover autonomia no cuidado, por meio da educação em saúde. — associação correta');
    assert.match(fixture.targets[1].getAttribute('aria-label'), /^Psicoterápica — .* — associação incorreta$/);
    assert.equal(fixture.result.hidden, false);
    assert.ok(fixture.result.textContent.includes('Revise os pares incorretos e tente novamente.'));
    fixture.pair(1, 1);
    assert.equal(fixture.targets[2].label.textContent, '(arraste aqui)');
    assert.equal(fixture.result.hidden, true);
    fixture.pair(2, 2);
    assert.equal(fixture.progress.textContent, '4 / 4 corretos');
    assert.ok(fixture.result.textContent.includes('Muito bem! Você acertou todos os pares.'));
    fixture.activity.emit('click', {target: fixture.reset});
    assert.equal(fixture.progress.textContent, '0 / 4 corretos');
    assert.equal(fixture.result.hidden, true);
    assert.equal(fixture.terms[0].focused, true);
    assert.ok(fixture.targets.every((target) => target.getAttribute('aria-label') === null));
    cleanup();
    assert.equal(fixture.activity.listeners.size, 0);
    assert.equal(fixture.terms[0].getAttribute('draggable'), null);
    assert.equal(fixture.progress.getAttribute('aria-live'), null);
});

test('arrastar e soltar usa os mesmos pares e restaura o DOM no encerramento da página', () => {
    const fixture = matchingFixture();
    const cleanup = bindUnitFourTools(fixture.root);
    const transfer = {setData(type, value) { this.type = type; this.value = value; }};
    fixture.activity.emit('dragstart', {target: fixture.terms[0], dataTransfer: transfer});
    assert.equal(transfer.value, 't1');
    const dragover = fixture.activity.emit('dragover', {target: fixture.targets[0], dataTransfer: transfer});
    assert.equal(dragover.defaultPrevented, true);
    assert.equal(fixture.targets[0].dataset.matchingDragOver, 'true');
    fixture.activity.emit('drop', {target: fixture.targets[0], dataTransfer: transfer});
    assert.equal(fixture.progress.textContent, '1 / 4 corretos');
    assert.equal(fixture.targets[0].dataset.matchingState, 'correct');
    cleanup();
    cleanup();
    assert.equal(fixture.progress.textContent, '0 / 4 corretos');
    assert.equal(fixture.targets[0].label.textContent, '(arraste aqui)');
    assert.equal(fixture.targets[0].getAttribute('data-matching-state'), null);
    assert.equal(fixture.targets[0].getAttribute('aria-label'), null);
    assert.equal(fixture.activity.listeners.size, 0);
});


test('binder não altera páginas pertencentes a outra unidade', () => {
    let queries = 0;
    const cleanup = bindUnitFourTools({querySelector(selector) { queries++; assert.equal(selector, '[data-unit="unidade-4"]'); return null; }});
    cleanup();
    assert.equal(queries, 1);
});

test('navegação de leitura foca apenas destinos da própria unidade e respeita movimento reduzido', () => {
    const originalMatchMedia = globalThis.matchMedia;
    const unit = new Element('unit');
    const button = new Element('reading', {unitFourReading: 'u4-sintese'});
    button.closest = (selector) => selector === '[data-unit-four-reading]' ? button : null;
    const target = new Element('section');
    target.id = 'u4-sintese';
    target.scrollIntoView = (options) => { target.scrollOptions = options; };
    unit.contains = (node) => node === button || node === target;
    unit.querySelectorAll = (selector) => selector === '[data-unit-four-reading]' ? [button] : selector === '[id]' ? [target] : [];
    const root = {querySelector: () => unit};
    try {
        globalThis.matchMedia = () => ({matches: true});
        const cleanup = bindUnitFourTools(root);
        unit.emit('click', {target: button});
        assert.equal(target.focused, true);
        assert.equal(target.getAttribute('tabindex'), '-1');
        assert.deepEqual(target.scrollOptions, {block: 'start', behavior: 'auto'});
        globalThis.matchMedia = () => ({matches: false});
        unit.emit('click', {target: button});
        assert.deepEqual(target.scrollOptions, {block: 'start', behavior: 'smooth'});
        button.dataset.unitFourReading = 'destino-inexistente';
        target.focused = false;
        unit.emit('click', {target: button});
        assert.equal(target.focused, false);
        cleanup();
        assert.equal(unit.listeners.size, 0);
        assert.equal(target.getAttribute('tabindex'), null);
    } finally {
        if (originalMatchMedia === undefined) delete globalThis.matchMedia;
        else globalThis.matchMedia = originalMatchMedia;
    }
});
