import test from 'node:test';
import assert from 'node:assert/strict';
import {unitsBySlug} from '../assets/js/data/course.js';
import {bindConfiguredLinks} from '../assets/js/views/unit-view.js';

function anchor(href, key = 'forumUrl', fallback) {
    const attributes = new Map(href == null ? [] : [['href', href]]);
    const listeners = new Set();
    return {
        dataset: {configLink: key, configFallback: fallback},
        listeners,
        get href() { return attributes.get('href') || ''; },
        set href(value) { attributes.set('href', value); },
        get title() { return attributes.get('title') || ''; },
        set title(value) { attributes.set('title', value); },
        getAttribute: name => attributes.get(name) ?? null,
        setAttribute: (name, value) => attributes.set(name, value),
        removeAttribute: name => attributes.delete(name),
        addEventListener(type, handler) { assert.equal(type, 'click'); listeners.add(handler); },
        removeEventListener(type, handler) { assert.equal(type, 'click'); listeners.delete(handler); },
        click() {
            const event = {defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }};
            for (const handler of listeners) handler(event);
            return event;
        },
    };
}

const rootFor = links => ({querySelectorAll: () => links});

test('habilita fórum e avaliação da página 8 pelo href quando a configuração está vazia', () => {
    const page = unitsBySlug.get('unidade-1').pages[7].html;
    const markup = [...page.matchAll(/<a\b[^>]*data-config-link="([^"]+)"[^>]*>/g)];
    assert.equal(markup.length, 2);
    const links = markup.map(([tag, key]) => anchor(tag.match(/\bhref="([^"]+)"/)[1], key));
    const destinations = links.map(link => link.href);
    const cleanup = bindConfiguredLinks(rootFor(links));
    links.forEach((link, index) => {
        assert.equal(link.href, destinations[index]);
        assert.equal(link.getAttribute('aria-disabled'), null);
        assert.equal(link.click().defaultPrevented, false);
        assert.equal(link.target, '_blank');
        assert.equal(link.rel, 'noopener noreferrer');
    });
    cleanup();
});

test('prioriza configuração principal e alternativa antes do href, ignorando valores vazios', () => {
    for (const [config, expected] of [
        [{specific: 'https://example.com/specific', general: 'https://example.com/general'}, 'https://example.com/specific'],
        [{specific: '', general: 'https://example.com/general'}, 'https://example.com/general'],
        [{specific: '  ', general: ' https://example.com/general '}, 'https://example.com/general'],
        [{specific: '#', general: ''}, '/mod/forum/view.php?id=6'],
    ]) {
        const link = anchor('/mod/forum/view.php?id=6', 'specific', 'general');
        link.title = 'Abrir atividade no Moodle';
        const cleanup = bindConfiguredLinks(rootFor([link]), config);
        assert.equal(link.href, expected);
        assert.equal(link.title, 'Abrir atividade no Moodle');
        assert.equal(link.click().defaultPrevented, false);
        cleanup();
    }
});

test('mantém destinos ausentes e href de marcação desativados e limpa seus eventos', () => {
    for (const href of [null, '', '   ', '#', ' # ']) {
        const link = anchor(href);
        const cleanup = bindConfiguredLinks(rootFor([link]), {});
        assert.equal(link.getAttribute('aria-disabled'), 'true');
        assert.equal(link.title, 'Link ainda não configurado.');
        assert.equal(link.click().defaultPrevented, true);
        cleanup();
        assert.equal(link.listeners.size, 0);
    }
});

test('remove a sinalização de desativado quando um href é informado posteriormente', () => {
    const link = anchor('#');
    bindConfiguredLinks(rootFor([link]), {})();
    link.href = 'https://example.com/activity';
    const cleanup = bindConfiguredLinks(rootFor([link]), {});
    assert.equal(link.getAttribute('aria-disabled'), null);
    assert.equal(link.title, '');
    assert.equal(link.click().defaultPrevented, false);
    cleanup();
});
