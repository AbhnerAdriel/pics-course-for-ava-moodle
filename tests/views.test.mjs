import test from 'node:test';
import assert from 'node:assert/strict';
import {course, unitsBySlug} from '../assets/js/data/course.js';
import {renderHome} from '../assets/js/views/home-view.js';
import {renderUnit} from '../assets/js/views/unit-view.js';

const progressStore = {
    unitPercent: () => 0,
    getUnit: () => ({lastPage: 1, visitedPages: [], completed: false}),
    coursePercent: () => 0,
};

test('renderiza a página principal com rotas SPA', () => {
    const html = renderHome({course, progressStore});
    assert.match(html, /data-view="home"/);
    assert.match(html, /#\/unidade\/introducao\/pagina\/1/);
    assert.doesNotMatch(html, /target="_blank"/);
    assert.doesNotMatch(html, /\.\/unidade\/introducao\/conteudo\.html/);
});

test('renderiza unidade e página de conteúdo', () => {
    const unit = unitsBySlug.get('boas-vindas');
    const html = renderUnit({course, unit, page: 2});
    assert.match(html, /data-unit="boas-vindas"/);
    assert.match(html, /Prazer em Conhecê-lo/);
    assert.match(html, /Página 2 de 3/);
    assert.match(html, /boas-vindas-ao-pics\.webp/);
    assert.doesNotMatch(html, /\.\.\/\.\.\/assets/);
});
