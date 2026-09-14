import {appConfig} from '../../config.js';
import {unitFourSourcePages} from './unidade-4-content.js';
import {groupPurposes, mapNodes, practiceScripts, matchingTerms, matchingTargets, unitFourQuestions, unitFourMessages} from './unidade-4-interactions.js';

const escapeText = value => String(value).replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));

function groupPurposeDetails() {
    return `<div class="u4-groups">${groupPurposes.map((group, index) => `<details${index === 0 ? ' open' : ''}>
        <summary>${escapeText(group.title)}</summary>
        <div class="u4-group-copy">
            <p><strong>${unitFourMessages.objectiveLabel}</strong> ${escapeText(group.objective)}</p>
            <p><strong>${unitFourMessages.relationLabel}</strong> ${escapeText(group.picsRelation)}</p>
            <p><strong>${unitFourMessages.examplesLabel}</strong> ${escapeText(group.examples)}</p>
        </div>
    </details>`).join('')}</div>`;
}

function conceptMap() {
    return `<div class="u4-concept-map" data-content-slider aria-labelledby="u4-page-3-section-2">
        <div class="u4-concept-map__tabs u2-benefits__tabs" role="tablist" aria-label="Mapa conceitual interativo">
            ${mapNodes.map((node, index) => `<button type="button" role="tab" id="u4-map-tab-${node.id}" data-slide-to="${index}" aria-controls="u4-map-panel-${node.id}">${escapeText(node.label)}</button>`).join('')}
        </div>
        <div class="u4-concept-map__panels">
            ${mapNodes.map(node => `<article class="u4-concept-map__panel" role="tabpanel" tabindex="0" id="u4-map-panel-${node.id}" data-content-slide aria-labelledby="u4-map-tab-${node.id}">
                <h4>${escapeText(node.label)}</h4><p>${escapeText(node.detail)}</p>
            </article>`).join('')}
        </div>
    </div>`;
}

function practiceScriptsTabs() {
    return `<div class="u4-practice" data-content-slider aria-labelledby="u4-page-6-section-3">
        <div class="u4-practice__tabs u2-benefits__tabs" role="tablist" aria-label="Roteiros de vivência com PICS">
            ${practiceScripts.map((script, index) => `<button type="button" role="tab" id="u4-practice-tab-${script.id}" data-slide-to="${index}" aria-controls="u4-practice-panel-${script.id}">${escapeText(script.label)}</button>`).join('')}
        </div>
        ${practiceScripts.map(script => `<article class="u4-practice__panel" role="tabpanel" tabindex="0" id="u4-practice-panel-${script.id}" data-content-slide aria-labelledby="u4-practice-tab-${script.id}">
            <header><h4>${escapeText(script.label)}</h4><p class="u4-practice__meta">${escapeText(script.meta)}</p></header>
            <ol class="u4-practice__steps">${script.steps.map(step => `<li><h5>${escapeText(step.title)}</h5><p>${escapeText(step.text)}</p></li>`).join('')}</ol>
        </article>`).join('')}
    </div>`;
}

function matchingActivity() {
    return `<div class="u4-matching" data-unit-four-matching>
        <div class="u4-matching__terms" aria-label="Finalidades de grupos e oficinas">${matchingTerms.map(term => `<button type="button" data-matching-term="${term.id}" aria-pressed="false" aria-label="Selecionar ${escapeText(term.label)}">${escapeText(term.label)}</button>`).join('')}</div>
        <div class="u4-matching__targets">${matchingTargets.map(target => `<button type="button" data-matching-target="${target.id}" aria-label="Associar finalidade: ${escapeText(target.description)}"><span class="u4-matching__label" data-matched-label>${unitFourMessages.matchingPlaceholder}</span><span class="u4-matching__description">${escapeText(target.description)}</span></button>`).join('')}</div>
        <div class="u4-matching__actions"><button class="u2-action u2-action--secondary" type="button" data-matching-reset>Reiniciar atividade</button><p data-matching-progress aria-live="polite">0 / ${matchingTargets.length} ${unitFourMessages.matchingProgressSuffix}</p></div>
        <p class="u4-matching__result" data-matching-result hidden aria-live="polite"></p>
    </div>`;
}

function quizForm() {
    return `<form class="u4-quiz" data-unit-four-quiz>
        ${unitFourQuestions.map((question, index) => `<fieldset class="u2-question" data-unit-four-question="${index}">
            <legend><span class="u2-question__number">${escapeText(question.label)}</span>${escapeText(question.prompt)}</legend>
            <div class="u2-question__options">${question.options.map((option, optionIndex) => `<label><input type="radio" name="question-${index}" value="${optionIndex}" required><span>${escapeText(option)}</span></label>`).join('')}</div>
            <div class="u2-question__feedback" data-quiz-feedback="${index}" hidden><p><strong>${unitFourMessages.feedbackLabel}</strong> ${escapeText(question.feedback)}</p><p><strong>${unitFourMessages.relatedObjectiveLabel}</strong> ${escapeText(question.objective)}</p></div>
        </fieldset>`).join('')}
        <div class="u2-quiz__actions"><button class="u2-action" type="submit" data-quiz-submit>Enviar respostas</button><p class="u2-quiz__result" data-quiz-score hidden tabindex="-1" aria-live="polite"></p><button class="u2-action u2-action--secondary" type="reset" data-quiz-reset hidden>Refazer questionário</button></div>
    </form>`;
}

function videoResource() {
    const url = appConfig.unitFourVideoUrl;
    if (!url) return '';
    const media = /\.(mp4|webm|ogg)(?:[?#]|$)/i.test(url)
        ? `<video src="${escapeText(url)}" controls preload="metadata" aria-label="Vídeo VA4: PICS no território"></video>`
        : `<iframe src="${escapeText(url)}" title="Vídeo VA4: PICS no território" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    return `<section class="pics-video u4-video" data-pics-video aria-label="Vídeo VA4: PICS no território"><div class="pics-video__stage"><div class="pics-video__frame"><div class="pics-video__media-shell"><div class="pics-video__media">${media}</div></div></div></div></section>`;
}

const renderers = {groups: groupPurposeDetails, 'concept-map': conceptMap, practice: practiceScriptsTabs, matching: matchingActivity, quiz: quizForm, video: videoResource};

function renderPage(page, index) {
    const sections = page.sections.map(section => section.type === 'html' ? section.content : renderers[section.type]());
    if (index === 5) {
        const destinations = page.headings.slice(1);
        const readingNav = `<nav class="u2-reading-nav u4-reading-nav" aria-label="Nesta página">${destinations.map(heading => `<button type="button" data-unit-four-reading="${heading.id}">${escapeText(heading.text)}</button>`).join('')}</nav>`;
        sections.splice(1, 0, readingNav);
    }
    return `<div class="u4-lesson u2-lesson">${sections.join('\n')}</div>`;
}

export const unitFour = {
    slug: 'unidade-4',
    eyebrow: 'Unidade 4',
    title: 'Campo de atuação no território e PICS como estratégia de cuidado integral',
    bannerTitle: 'Unidade 4',
    bannerSubtitle: 'Campo de atuação no território e PICS como estratégia de cuidado integral',
    menuTitle: 'Conteúdo da Unidade 4',
    pages: unitFourSourcePages.map((page, index) => ({title: page.title, className: `pagina-unidade-4 pagina-unidade-4--${index + 1}`, html: renderPage(page, index)})),
};
