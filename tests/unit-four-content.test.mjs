import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {course, unitsBySlug} from '../assets/js/data/course.js';
import {unitFour} from '../assets/js/data/units/unidade-4.js';
import {unitFourSourcePages} from '../assets/js/data/units/unidade-4-content.js';
import {groupPurposes, mapNodes, practiceScripts, matchingTerms, matchingTargets, unitFourMessages} from '../assets/js/data/units/unidade-4-interactions.js';
import {renderUnit} from '../assets/js/views/unit-view.js';
import {parseRoute, toHash, unitPath} from '../assets/js/core/router.js';

const source = JSON.parse(readFileSync(new URL('./fixtures/unit-four-source-text.json', import.meta.url), 'utf8'));

function plainText(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ').trim();
}

function countOccurrences(text, part) {
    return text.split(part).length - 1;
}

test('integra a Unidade 4 e separa as referências na nova página', () => {
    assert.equal(course.units.find(unit => unit.slug === 'unidade-4').available, true);
    assert.equal(unitsBySlug.get('unidade-4'), unitFour);
    assert.deepEqual(unitFour.pages.map(page => page.title), [...source.pages.slice(0, 5).map(page => page.title), 'Refletir, praticar e encerrar', 'Referências e materiais complementares']);
    assert.equal(unitFour.pages.length, 7);
    for (let page = 1; page <= 7; page++) {
        const route = parseRoute(toHash(unitPath('unidade-4', page)));
        assert.equal(route.name, 'unit');
        assert.equal(route.slug, 'unidade-4');
        assert.equal(route.page, page);
        const html = renderUnit({course, unit: unitsBySlug.get(route.slug), page: route.page});
        assert.match(html, new RegExp(`data-unit="unidade-4" data-page="${page}"`));
        assert.match(html, new RegExp(`Página ${page} de 7`));
        for (let destination = 1; destination <= 7; destination++) {
            assert.ok(html.includes(`href="${toHash(unitPath('unidade-4', destination))}"`));
        }
        assert.doesNotMatch(html, /unidade-4\/pagina\/8/);
    }
});

test('preserva os textos mantidos após a remoção solicitada da identificação da aula', () => {
    assert.equal(source.pages.reduce((total, page) => total + page.blocks.length, 0), 145);
    assert.equal(source.visibleText.length, 176);
    const originalLastPage = source.pages[5].visibleText;
    const expectedByPage = [
        ...source.pages.slice(0, 5).map(page => page.visibleText),
        [...originalLastPage.slice(0, 34), ...originalLastPage.slice(80, 85)],
        originalLastPage.slice(85),
    ];
    for (const [index, page] of expectedByPage.entries()) {
        const text = plainText(unitFour.pages[index].html);
        let offset = 0;
        const visibleText = (index === 0 ? page.slice(5) : page).map(segment => [
            '[Acolhimento e contextualização]', '[Encerramento e continuidade]', '[Referências e materiais complementares]',
        ].includes(segment) ? segment.slice(1, -1) : segment);
        for (const segment of visibleText) {
            const position = text.indexOf(segment, offset);
            assert.ok(position >= 0, `Página ${index + 1}: trecho ausente, alterado ou fora da ordem: ${segment}`);
            offset = position + segment.length;
        }
        const originalText = visibleText.join(' ');
        for (const segment of new Set(visibleText.filter(value => value.length > 80))) {
            assert.equal(countOccurrences(text, segment), countOccurrences(originalText, segment),
                `Página ${index + 1}: trecho duplicado: ${segment}`);
        }
    }
    const allText = plainText(unitFour.pages.map(page => page.html).join(' '));
    assert.ok(!allText.includes(source.generalText[0]));
    assert.doesNotMatch(unitFour.pages[0].html, /Identificação da aula|Carga horária estimada:|<b>Título:<\/b>|<b>Curso:<\/b>|<b>Descrição:<\/b>/);
    assert.match(unitFour.pages[0].html, /u4-introduction__tag\">Introdução/);
    assert.doesNotMatch(unitFour.pages[0].html, /\[Acolhimento e contextualização\]/);
    assert.doesNotMatch(unitFour.pages[5].html, /Avaliação da aprendizagem|data-unit-four-quiz|Questão 1\.|Pontuação sugerida:|Nota mínima para aprovação:/);
    assert.doesNotMatch(allText, /\[Encerramento e continuidade\]|\[Referências e materiais complementares\]/);
    assert.match(unitFour.pages[6].html, /Referências utilizadas nesta unidade:/);
});

test('mantém exatamente os dados dinâmicos e todos os 88 textos apresentados nas interações', () => {
    assert.deepEqual(groupPurposes, source.data.GROUP_PURPOSE);
    assert.deepEqual(mapNodes, source.data.MAP_NODES);
    assert.deepEqual(practiceScripts, source.data.PRACTICE_SCRIPTS);
    assert.deepEqual(matchingTerms, source.data.DRAG_TERMS);
    assert.deepEqual(matchingTargets, source.data.DRAG_TARGETS);
    assert.equal(source.dynamicText.length, 88);
    const text = plainText(unitFour.pages.map(page => page.html).join(' '));
    for (const segment of source.dynamicText) {
        assert.ok(text.includes(segment), `Texto dinâmico ausente ou alterado: ${segment}`);
    }
    assert.deepEqual([
        unitFourMessages.objectiveLabel, unitFourMessages.relationLabel, unitFourMessages.examplesLabel,
    ], source.interactionText.accordion.labels);
    const activity = source.interactionText.dragActivity;
    assert.equal(unitFourMessages.matchingPlaceholder, activity.dropPlaceholder);
    assert.equal(unitFourMessages.matchingSuccess, activity.success);
    assert.equal(unitFourMessages.matchingRetry, activity.pending);
    assert.ok(text.includes(activity.reset));
    assert.ok(text.includes(activity.progressExamples[0]));
});

test('conserva todos os links de leitura na sequência e fornece os 15 PDFs locais válidos', () => {
    const documents = new Set();
    const expectedLinks = source.resources.filter(resource => !resource.editorial)
        .map(resource => ({href: resource.href.replace('./docs/', './assets/documents/unidade-4/'), label: resource.label}));
    const actualLinks = [...unitFour.pages.map(page => page.html).join(' ').matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
        .filter(([, href]) => href.endsWith('.pdf') || href.startsWith('https://globoplay.globo.com/'))
        .map(([, href, label]) => ({href, label: plainText(label)}));
    assert.deepEqual(actualLinks, expectedLinks, 'Links alterados, removidos ou repetidos');
    for (const page of unitFour.pages) {
        for (const [, file] of page.html.matchAll(/(?:src|href)="(\.\/assets\/[^"#]+)"/g)) {
            const path = new URL(`../${file}`, import.meta.url);
            assert.ok(existsSync(path), `Recurso local ausente: ${file}`);
            if (file.endsWith('.pdf')) {
                documents.add(file);
                const bytes = readFileSync(path);
                assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
                assert.ok(bytes.subarray(-2048).includes(Buffer.from('%%EOF')), `PDF incompleto: ${file}`);
            }
        }
    }
    assert.equal(documents.size, 15);
});

test('oferece os componentes acessíveis do projeto sem restringir a atividade ao arrastar com mouse', () => {
    const groups = [...unitFour.pages[1].html.matchAll(/<details\b([^>]*)>/g)];
    assert.equal(groups.length, 7);
    assert.match(groups[0][1], /\bopen\b/);
    assert.ok(groups.slice(1).every(([, attributes]) => !/\bopen\b/.test(attributes)));
    for (const [pageIndex, prefix, nodes] of [[2, 'u4-map', mapNodes], [5, 'u4-practice', practiceScripts]]) {
        const html = unitFour.pages[pageIndex].html;
        for (const node of nodes) {
            const tab = `${prefix}-tab-${node.id}`;
            const panel = `${prefix}-panel-${node.id}`;
            assert.ok(html.includes(`id="${tab}"`));
            assert.ok(html.includes(`aria-controls="${panel}"`));
            assert.ok(html.includes(`id="${panel}"`));
            assert.ok(html.includes(`aria-labelledby="${tab}"`));
        }
    }
    const activity = unitFour.pages[5].html;
    assert.equal((activity.match(/<button\b[^>]*data-matching-term=/g) || []).length, 4);
    assert.equal((activity.match(/<button\b[^>]*data-matching-target=/g) || []).length, 4);
    assert.match(activity, /data-matching-progress aria-live="polite"/);
    assert.match(activity, /data-matching-result hidden aria-live="polite"/);
    assert.match(activity, /data-config-link="unitFourForumUrl" data-config-fallback="forumUrl"/);
});

test('os destinos de leitura e referências de acessibilidade existem e não duplicam IDs', () => {
    for (const [index, page] of unitFour.pages.entries()) {
        const ids = [...page.html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
        assert.equal(new Set(ids).size, ids.length, `IDs repetidos na página ${index + 1}`);
        for (const [, attribute, values] of page.html.matchAll(/\b(aria-labelledby|aria-controls)="([^"]+)"/g)) {
            for (const value of values.split(/\s+/)) {
                assert.ok(ids.includes(value), `${attribute} referencia ID ausente na página ${index + 1}: ${value}`);
            }
        }
        for (const heading of unitFourSourcePages[index].headings) {
            assert.ok(ids.includes(heading.id));
            assert.ok(plainText(page.html).includes(heading.text));
        }
        for (const [, destination] of page.html.matchAll(/data-unit-four-reading="([^"]+)"/g)) {
            assert.ok(ids.includes(destination), `Destino de leitura ausente: ${destination}`);
        }
        for (const [, content] of page.html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)) {
            assert.doesNotMatch(content, /<(?:p|div|section|aside|ul|ol|blockquote|h[1-6])\b/, 'Parágrafo contém um bloco HTML inválido');
        }
    }
});

test('mantém as notas de produção separadas e não apresenta links de referência como o vídeo VA4', () => {
    const html = unitFour.pages.map(page => page.html).join(' ');
    const text = plainText(html);
    assert.doesNotMatch(text, /ESPAÇO RESERVADO PARA INSERÇÃO DE RECURSO|Orientações pedagógicas - não é conteúdo do aluno|PARTE 3 -|PARTE 4 -|\[será inserido no moodle\]|\[RESPOSTA CORRETA\]/);
    for (const note of source.editorialText) {
        if (note.text.length > 40) assert.ok(!text.includes(note.text), `Nota editorial indevidamente exibida: ${note.text}`);
    }
    const videoPage = unitFour.pages[3].html;
    assert.match(videoPage, /https:\/\/globoplay\.globo\.com\/v\/14207578\/\?s=0s/);
    assert.match(videoPage, /https:\/\/globoplay\.globo\.com\/v\/14207580\/\?s=0s/);
    assert.doesNotMatch(videoPage, /<(?:iframe|video)\b[^>]*globoplay/i);
    const references = source.pages[5].blocks.filter(block => block.line >= 352 && block.line <= 363);
    assert.equal(references.length, 12);
    for (const reference of references) assert.ok(plainText(unitFour.pages[6].html).includes(reference.text));
});
