import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {course, unitsBySlug} from '../assets/js/data/course.js';
import {unitTwo, unitTwoQuestions} from '../assets/js/data/units/unidade-2.js';
import {evaluateUnitTwoAnswers} from '../assets/js/components/unit-two-tools.js';
import {renderUnit} from '../assets/js/views/unit-view.js';
import {parseRoute} from '../assets/js/core/router.js';

const originalText = JSON.parse(readFileSync(new URL('./fixtures/unit-two-source-text.json', import.meta.url), 'utf8'));

function plainText(html) {
    return html.replace(/<\/?(?:em|strong|span|time|b|i|br)\b[^>]*>/g, '')
        .replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ').trim();
}

test('disponibiliza as oito páginas da Unidade 2 após a remoção da avaliação', () => {
    assert.equal(course.units.find((unit) => unit.slug === 'unidade-2').available, true);
    assert.equal(unitsBySlug.get('unidade-2'), unitTwo);
    assert.equal(unitTwo.pages.length, 8);
    assert.equal(unitTwo.pages[6].className, 'pagina-referencias-unidade-2');
    assert.equal(unitTwo.pages[7].className, 'pagina-biblioteca-unidade-2');
    for (let page = 1; page <= 8; page++) {
        const html = renderUnit({course, unit: unitTwo, page});
        assert.match(html, new RegExp(`data-unit="unidade-2" data-page="${page}"`));
        assert.match(html, new RegExp(`Página ${page} de 8`));
        assert.doesNotMatch(html, /data-unit-two-quiz|u2-avaliacao-titulo|unidade-2\/pagina\/9/);
        assert.doesNotMatch(html, /\{\{|\$\{|image-slot|sc-for|sc-if|onClick=|INÍCIO DA PÁGINA|FIM DA PÁGINA/);
    }
});

test('preserva o texto da fonte mantido após a remoção da avaliação e a substituição da HQ', () => {
    const content = plainText(unitTwo.pages.map((page) => page.html).join(' '));
    // A página de avaliação foi removida a pedido do usuário; a fonte permanece intacta.
    const removedText = new Set([
        'Avaliação da Unidade 2',
        '05 questões de múltipla escolha',
        'O questionário a seguir possui questões de múltipla escolha, cada qual constituída de 5 alternativas, admitindo apenas 1 como opção correta. Retorne quantas vezes for necessário à leitura e ao estudo do tema, em caso de dúvidas.',
        'Enviar respostas',
        'Refazer questionário',
        'Dialogando com a Prática',
        'Mapa de Referências - Práticas Integrativas e Complementares em Saúde',
        'Histórico em quadrinhos',
        '"Cuidar da Saúde no Território: Saberes que se Encontram"',
        'Página 1 - Joana e as plantas medicinais',
        'Página 2 - Ravi e as práticas corporais da MTC',
        'Página 3 - Conceição e a roda de TCI',
    ]);
    // As três mensagens finais da HQ permanecem no aviso abaixo do flipbook.
    for (const sourceText of [...originalText.visibleText, ...originalText.dynamicText, ...originalText.storyText.slice(-3)]) {
        if (removedText.has(sourceText)) continue;
        assert.ok(content.includes(sourceText), `Texto original ausente ou modificado: ${sourceText}`);
    }
    assert.doesNotMatch(content, /SUGESTÃO DO MINISTÉRIO|INSERIR COMO|Cenário:|Modelos de UBS|biotipos de praticantes/);
    assert.deepEqual(unitTwoQuestions, originalText.questions, 'Questões, alternativas, gabarito e devolutivas devem manter o conteúdo da fonte.');
});

test('todos os recursos locais existem e os oito documentos são PDFs válidos', () => {
    const html = unitTwo.pages.map((page) => page.html).join(' ');
    const documents = new Set();
    for (const match of html.matchAll(/(?:src|href)="(\.\/assets\/[^"#]+)"/g)) {
        const file = new URL(`../${match[1]}`, import.meta.url);
        assert.ok(existsSync(file), `Recurso ausente: ${match[1]}`);
        if (match[1].endsWith('.pdf')) {
            documents.add(match[1]);
            assert.equal(readFileSync(file).subarray(0, 5).toString(), '%PDF-');
        }
    }
    assert.equal([...documents].filter((file) => file.startsWith('./assets/documents/unidade-2/')).length, 8);
    assert.ok(documents.has('./assets/flipbook/pdf/HQ_page-0001.pdf'));
});

test('a página 5 usa o mesmo flipbook da Unidade 1 e mantém o aviso logo abaixo', () => {
    const page = unitTwo.pages[4].html;
    const unitOnePage = unitsBySlug.get('unidade-1').pages[1].html;
    const component = /<pics-flipbook\b[\s\S]*?<\/pics-flipbook>/;
    const attributes = (html) => [...html.match(component)[0].matchAll(/(src|title)="([^"]+)"/g)].map(([, name, value]) => [name, value]);
    assert.deepEqual(attributes(page), attributes(unitOnePage));
    assert.doesNotMatch(page, /<section class="u2-story"|u2-story__scene/);
    assert.match(page, /<\/pics-flipbook>\s*<aside class="pics-callout u2-callout">/);
    assert.equal((page.match(/Mensagem-chave para ACS e ACE/g) || []).length, 1);
});

test('substitui o infográfico de plantas por oito slides e preserva seu texto completo', () => {
    const source = JSON.parse(readFileSync(new URL('./fixtures/plant-safety-image-text.json', import.meta.url), 'utf8'));
    const html = unitTwo.pages[1].html;
    const carousel = html.match(/<figure class="pics-policy-slider u2-plant-safety"[\s\S]*?<\/figure>/)?.[0];
    assert.ok(carousel);
    assert.doesNotMatch(html, /src="[^\"]*figura2-plantas-uso-seguro\.png"/);
    assert.equal((carousel.match(/data-content-slide\s/g) || []).length, 8);
    assert.equal((carousel.match(/data-slide-to=/g) || []).length, 8);
    assert.match(carousel, /data-slide-previous/);
    assert.match(carousel, /data-slide-next/);
    const text = plainText(carousel);
    for (const block of [source.title, ...source.blocks]) {
        assert.ok(text.includes(block), `Texto do infográfico ausente ou modificado: ${block}`);
    }
    for (let page = 1; page <= 8; page++) {
        assert.ok(carousel.includes(`id="u2-plant-safety-panel-${page}"`));
        assert.ok(carousel.includes(`aria-controls="u2-plant-safety-panel-${page}"`));
    }
});

test('fornece ao componente existente a lista e os seis eventos de cada linha do tempo', () => {
    for (const page of [unitTwo.pages[1], unitTwo.pages[3]]) {
        const timeline = page.html.match(/<pics-horizontal-timeline\b[\s\S]*?<\/pics-horizontal-timeline>/)?.[0];
        assert.ok(timeline);
        assert.match(timeline, /<ol class="pics-horizontal-timeline__events" data-timeline-events>/);
        assert.equal((timeline.match(/<li data-timeline-event data-label=/g) || []).length, 6);
    }
});

test('os links da biblioteca abrem a página e o trecho correspondentes no roteador', () => {
    for (const [, hash, destination] of unitTwo.pages[7].html.matchAll(/href="([^"]+)" data-reading-destination="([^"]+)"/g)) {
        const route = parseRoute(hash);
        assert.equal(route.name, 'unit');
        assert.equal(route.slug, 'unidade-2');
        assert.ok(unitTwo.pages[route.page - 1].html.includes(`id="${destination}"`), `Trecho ausente: ${destination}`);
    }
});

test('avalia apenas respostas completas, aplica o gabarito original e calcula a nota', () => {
    assert.equal(evaluateUnitTwoAnswers([0, 1, null, 3, 4]), null);
    assert.equal(evaluateUnitTwoAnswers([0, 1, 2, 3]), null);
    assert.equal(evaluateUnitTwoAnswers([0, 1, 2, 3, 5]), null);
    assert.equal(evaluateUnitTwoAnswers(['3', 2, 2, 1, 2]), null);
    assert.equal(evaluateUnitTwoAnswers(new Array(5)), null);
    assert.deepEqual(unitTwoQuestions.map((question) => question.correctIndex), [3, 2, 2, 1, 2]);
    assert.deepEqual(evaluateUnitTwoAnswers([3, 2, 2, 1, 2]), {correct: [true, true, true, true, true], score: 10, total: 10});
    assert.deepEqual(evaluateUnitTwoAnswers([3, 0, 2, 0, 2]), {correct: [true, false, true, false, true], score: 6, total: 10});
});
