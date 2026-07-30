import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeHash, parseRoute, unitPath, toHash} from '../assets/js/core/router.js';

test('normaliza a rota inicial', () => {
    assert.equal(normalizeHash(''), '/');
    assert.equal(normalizeHash('#/'), '/');
});

test('interpreta uma rota de unidade', () => {
    assert.deepEqual(parseRoute('#/unidade/boas-vindas/pagina/3'), {
        name: 'unit', path: '/unidade/boas-vindas/pagina/3', slug: 'boas-vindas', page: 3,
    });
});

test('limita número de página inválido ao mínimo', () => {
    assert.equal(parseRoute('#/unidade/introducao/pagina/0').page, 1);
});

test('gera hash estável', () => {
    assert.equal(unitPath('introducao', 2), '/unidade/introducao/pagina/2');
    assert.equal(toHash('/unidade/introducao/pagina/2'), '#/unidade/introducao/pagina/2');
});
