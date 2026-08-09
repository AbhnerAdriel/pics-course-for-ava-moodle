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

test('abre cards disponíveis em nova aba e preserva as demais unidades em preparação', () => {
    const html = renderHome({course});
    const availableCardLinks = html.match(/class="unidade-card-link"/g) || [];
    const preparingCard = html.match(/<article class="unidade-card"[^>]*aria-labelledby="unit-unidade-2-title">[\s\S]*?<\/article>/)?.[0] || '';

    assert.equal(availableCardLinks.length, 3);
    assert.match(html, /class="unidade-card-link" href="#\/unidade\/introducao\/pagina\/1" target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /aria-label="Acessar Apresentação em nova aba"/);
    assert.match(html, /class="unidade-card-link" href="#\/unidade\/unidade-1\/pagina\/1" target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /aria-label="Acessar Introdução às PICS no SUS: princípios e bases legais em nova aba"/);
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

test('renderiza a primeira página da Unidade 1 com o texto e as três figuras informadas', () => {
    const unit = unitsBySlug.get('unidade-1');
    const html = renderUnit({course, unit, page: 1});

    assert.match(html, /data-unit="unidade-1"/);
    assert.match(html, /O que são as Práticas Integrativas e Complementares em Saúde \(PICS\)/);
    assert.match(html, /Nesta primeira aula, você conhecerá as Práticas Integrativas e Complementares em Saúde/);
    assert.match(html, /Ao longo da narrativa, você conhecerá personagens com diferentes histórias/);
    assert.match(html, /Durante a leitura, observe como o diálogo entre profissionais, comunidade e saberes populares/);
    assert.match(html, /Ao concluir esta aula, você terá uma visão inicial sobre o que são as PICS/);
    assert.match(html, /figura-01-unidade-01\.webp/);
    assert.match(html, /figura-02-unidade-01\.webp/);
    assert.match(html, /figura-03-unidade-01\.webp/);
    assert.match(html, /Figura 8 – Momento coletivo de relaxamento/);
    assert.match(html, /Figura 9 – Atendimento individual com aplicação tópica/);
    assert.match(html, /Figura 10 – Encontro entre equipe de saúde e comunidade/);
    assert.match(html, /Página 1 de 2/);
    assert.match(html, /aria-valuenow="50"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/2"/);
});

test('renderiza o flipbook integrado como a segunda página da Unidade 1', () => {
    const unit = unitsBySlug.get('unidade-1');
    const html = renderUnit({course, unit, page: 2});
    const flipbooks = html.match(/<pics-flipbook\b/g) || [];

    assert.equal(unit.pages.length, 2);
    assert.equal(flipbooks.length, 1);
    assert.match(html, /data-unit="unidade-1" data-page="2"/);
    assert.match(html, /class="pagina-conteudo pagina-flipbook-interativo"/);
    assert.match(html, /class="flipbook-introducao"/);
    assert.match(html, /Conteúdo complementar/);
    assert.match(html, /Leitura: pensamentos, gentileza e respiração/);
    assert.match(html, /Leia a história em quadrinhos abaixo\. Você pode folhear pelas bordas das páginas/);
    assert.match(html, /src="\.\/assets\/flipbook\/pdf\/HQ_page-0001\.pdf"/);
    assert.match(html, /title="Não consigo dormir, meus pensamentos não param à noite"/);
    assert.match(html, /class="flipbook-reflexao"/);
    assert.match(html, /<strong>Para refletir:<\/strong> depois da leitura, identifique quais atitudes ajudaram a personagem a lidar melhor com seus pensamentos e emoções\./);
    assert.match(html, /Página 2 de 2/);
    assert.match(html, /aria-valuenow="100"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/1"/);
    assert.doesNotMatch(html, /<iframe\b/);
    assert.doesNotMatch(html, /demo-content|demo-after/);
});
