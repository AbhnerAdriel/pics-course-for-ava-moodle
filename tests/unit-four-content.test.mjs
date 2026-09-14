import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {course, unitsBySlug} from '../assets/js/data/course.js';
import {unitFour} from '../assets/js/data/units/unidade-4.js';
import {unitFourSourcePages} from '../assets/js/data/units/unidade-4-content.js';
import {groupPurposes, mapNodes, practiceScripts, matchingTerms, matchingTargets, unitFourQuestions, unitFourMessages} from '../assets/js/data/units/unidade-4-interactions.js';
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

test('integra as seis páginas da Unidade 4 na ordem do ZIP e na paginação existente', () => {
    assert.equal(course.units.find(unit => unit.slug === 'unidade-4').available, true);
    assert.equal(unitsBySlug.get('unidade-4'), unitFour);
    assert.deepEqual(unitFour.pages.map(page => page.title), source.pages.map(page => page.title));
    assert.equal(unitFour.pages.length, 6);
    for (let page = 1; page <= 6; page++) {
        const route = parseRoute(toHash(unitPath('unidade-4', page)));
        assert.equal(route.name, 'unit');
        assert.equal(route.slug, 'unidade-4');
        assert.equal(route.page, page);
        const html = renderUnit({course, unit: unitsBySlug.get(route.slug), page: route.page});
        assert.match(html, new RegExp(`data-unit="unidade-4" data-page="${page}"`));
        assert.match(html, new RegExp(`Página ${page} de 6`));
        for (let destination = 1; destination <= 6; destination++) {
            assert.ok(html.includes(`href="${toHash(unitPath('unidade-4', destination))}"`));
        }
        assert.doesNotMatch(html, /unidade-4\/pagina\/7/);
    }
});

test('preserva os 145 blocos e 176 segmentos didáticos sem omissões, alterações ou duplicação de trechos', () => {
    assert.equal(source.pages.reduce((total, page) => total + page.blocks.length, 0), 145);
    assert.equal(source.visibleText.length, 176);
    for (const [index, page] of source.pages.entries()) {
        const text = plainText(unitFour.pages[index].html);
        let offset = 0;
        for (const segment of page.visibleText) {
            const position = text.indexOf(segment, offset);
            assert.ok(position >= 0, `Página ${index + 1}: trecho ausente, alterado ou fora da ordem: ${segment}`);
            offset = position + segment.length;
        }
        const originalText = page.visibleText.join(' ');
        for (const segment of new Set(page.visibleText.filter(value => value.length > 80))) {
            assert.equal(countOccurrences(text, segment), countOccurrences(originalText, segment),
                `Página ${index + 1}: trecho duplicado: ${segment}`);
        }
    }
    const allText = plainText(unitFour.pages.map(page => page.html).join(' '));
    assert.ok(allText.includes(source.generalText[0]));
    assert.ok(allText.includes('Carga horária estimada: [A DEFINIR]'));
    assert.ok(allText.includes('Nota mínima para aprovação: [A DEFINIR PELA COORDENAÇÃO DO CURSO]'));
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

test('preserva as cinco perguntas, as 25 alternativas, o gabarito, as devolutivas e os objetivos', () => {
    const expected = source.questions.map(question => ({
        label: question.numberLabel,
        prompt: question.prompt,
        options: question.options.map((option, index) => `${question.optionLabels[index]} ${option}`),
        correctIndex: question.correctIndex,
        feedback: question.correctFeedback,
        objective: question.relatedObjective,
    }));
    assert.deepEqual(unitFourQuestions, expected);
    assert.deepEqual(unitFourQuestions.map(question => question.correctIndex), [2, 4, 2, 1, 0]);
    const quiz = unitFour.pages[5].html.match(/<form\b[^>]*data-unit-four-quiz[\s\S]*?<\/form>/)?.[0];
    assert.ok(quiz);
    assert.equal((quiz.match(/<fieldset\b/g) || []).length, 5);
    assert.equal((quiz.match(/<legend\b/g) || []).length, 5);
    assert.equal((quiz.match(/<input\b[^>]*type="radio"[^>]*required/g) || []).length, 25);
    for (let index = 0; index < 5; index++) {
        assert.equal((quiz.match(new RegExp(`name="question-${index}"`, 'g')) || []).length, 5);
        assert.match(quiz, new RegExp(`data-quiz-feedback="${index}" hidden`));
    }
    assert.match(quiz, /data-quiz-score hidden tabindex="-1" aria-live="polite"/);
    assert.match(quiz, /type="reset"[^>]*data-quiz-reset hidden/);
});

test('conserva todos os links de leitura na sequência e fornece os 15 PDFs locais válidos', () => {
    const documents = new Set();
    for (const [index, page] of unitFour.pages.entries()) {
        const expectedLinks = source.resources.filter(resource => resource.page === index + 1 && !resource.editorial)
            .map(resource => ({href: resource.href.replace('./docs/', './assets/documents/unidade-4/'), label: resource.label}));
        const actualLinks = [...page.html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
            .filter(([, href]) => href.endsWith('.pdf') || href.startsWith('https://globoplay.globo.com/'))
            .map(([, href, label]) => ({href, label: plainText(label)}));
        assert.deepEqual(actualLinks, expectedLinks, `Links alterados, removidos ou repetidos na página ${index + 1}`);
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
    for (const reference of references) assert.ok(plainText(unitFour.pages[5].html).includes(reference.text));
});
