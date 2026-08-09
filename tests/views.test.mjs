import test from 'node:test';
import assert from 'node:assert/strict';
import {course, unitsBySlug} from '../assets/js/data/course.js';
import {renderHome} from '../assets/js/views/home-view.js';
import {renderUnit} from '../assets/js/views/unit-view.js';

test('renderiza a página principal sem indicadores de progresso', () => {
    const html = renderHome({course});
    assert.match(html, /data-view="home"/);
    assert.match(html, /#\/unidade\/introducao\/pagina\/1/);
    assert.doesNotMatch(html, /<progress\b|curso-progresso|unidade-card-progresso|Continuar/);
    assert.doesNotMatch(html, /\.\/unidade\/introducao\/conteudo\.html/);
});

test('abre cards disponíveis em nova aba e preserva unidades em preparação', () => {
    const html = renderHome({course});
    const availableCardLinks = html.match(/class="unidade-card-link"/g) || [];
    const preparingCard = html.match(/<article class="unidade-card"[^>]*aria-labelledby="unit-unidade-1-title">[\s\S]*?<\/article>/)?.[0] || '';

    assert.equal(availableCardLinks.length, 2);
    assert.match(html, /class="unidade-card-link" href="#\/unidade\/introducao\/pagina\/1" target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /aria-label="Acessar Apresentação em nova aba"/);
    assert.match(preparingCard, /Conteúdo em preparação/);
    assert.match(preparingCard, /aria-disabled="true"/);
    assert.match(preparingCard, /Em breve/);
    assert.doesNotMatch(preparingCard, /<a\b|target="_blank"/);
});

test('renderiza unidade e página de conteúdo', () => {
    const unit = unitsBySlug.get('boas-vindas');
    const html = renderUnit({course, unit, page: 2});
    assert.match(html, /data-unit="boas-vindas"/);
    assert.match(html, /Prazer em Conhecê-lo/);
    assert.match(html, /Página 2 de 3/);
    assert.match(html, /boas-vindas-ao-pics\.webp/);
    assert.match(html, /role="progressbar"/);
    assert.match(html, /aria-valuenow="67"/);
    assert.doesNotMatch(html, /\.\.\/\.\.\/assets/);
});
