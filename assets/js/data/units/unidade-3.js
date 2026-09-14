import {appConfig} from '../../config.js';
import {unitThreeSourcePages} from './unidade-3-content.js';
import {ASHTANGA_PILLARS, BENEFIT_ACCORDION, MAP_NODES, MEDITATION_STEPS, matchingTerms, matchingTargets, unitThreeQuestions, unitThreeMessages} from './unidade-3-interactions.js';

const escapeText = value => String(value).replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));

function accordion(items, numbered = false) {
    return `<div class="u3-accordion">${items.map((item, index) => `<details${index === 0 ? ' open' : ''}><summary>${numbered ? `${index + 1}. ` : ''}${escapeText(item.title)}</summary><div class="u3-accordion__copy"><p>${escapeText(item.text)}</p></div></details>`).join('')}</div>`;
}

function slides(items, name, label, render) {
    return `<div class="u3-${name}" data-content-slider>
        <div class="u3-${name}__tabs u2-benefits__tabs" role="tablist" aria-label="${label}">${items.map((item, index) => `<button type="button" role="tab" id="u3-${name}-tab-${item.id}" data-slide-to="${index}" aria-controls="u3-${name}-panel-${item.id}">${escapeText(item.shortLabel ? `${index + 1}. ${item.shortLabel}` : item.label)}</button>`).join('')}</div>
        ${items.map(item => `<article class="u3-${name}__panel" data-content-slide role="tabpanel" tabindex="0" id="u3-${name}-panel-${item.id}" aria-labelledby="u3-${name}-tab-${item.id}"><h4>${escapeText(item.label)}</h4>${render(item)}</article>`).join('')}
    </div>`;
}

function audioResource() {
    return appConfig.unitThreeMeditationAudioUrl ? `<audio class="u3-audio" controls preload="metadata" src="${escapeText(appConfig.unitThreeMeditationAudioUrl)}" aria-label="Meditação guiada"></audio>` : '';
}

function meditation() {
    return slides(MEDITATION_STEPS, 'meditation', 'Passo a passo de uma técnica de Meditação com Yoga', step => `<p>${escapeText(step.detail)}</p>${step.resourceImage ? `<figure class="u3-posture"><img src="./assets/images/unidades/unidade-03/${escapeText(step.resourceImage.split('/').at(-1))}" width="${step.id === 's2' ? 244 : 262}" height="${step.id === 's2' ? 225 : 110}" alt="${escapeText(step.id === 's2' ? 'Pessoa sentada com as pernas cruzadas na postura Sukhasana.' : 'Pessoa deitada de costas na postura Shavasana.')}" loading="lazy" decoding="async"><figcaption>${escapeText(step.resourceCaption)}</figcaption></figure>` : ''}${step.id === 's4' ? audioResource() : ''}`);
}

function matching() {
    return `<div class="u3-matching" data-unit-three-matching>
        <div class="u3-matching__terms">${matchingTerms.map(term => `<button type="button" data-matching-term="${term.id}" aria-pressed="false" aria-label="Selecionar ${escapeText(term.label)}">${escapeText(term.label)}</button>`).join('')}</div>
        <div class="u3-matching__targets">${matchingTargets.map(target => `<button type="button" data-matching-target="${target.id}" aria-label="Associar termo: ${escapeText(target.description)}"><span class="u3-matching__label" data-matched-label>${unitThreeMessages.matchingPlaceholder}</span><span class="u3-matching__description">${escapeText(target.description)}</span></button>`).join('')}</div>
        <div class="u3-matching__actions"><button class="u2-action u2-action--secondary" type="button" data-matching-reset>Reiniciar atividade</button><p data-matching-progress aria-live="polite">0 / 4 ${unitThreeMessages.matchingProgressSuffix}</p></div>
        <p class="u3-matching__result" data-matching-result hidden aria-live="polite"></p>
    </div>`;
}

function quiz() {
    return `<form class="u3-quiz" data-unit-three-quiz>${unitThreeQuestions.map((question, index) => `<fieldset class="u2-question" data-unit-three-question="${index}"><legend><span class="u2-question__number">${escapeText(question.label)}</span>${escapeText(question.prompt)}</legend><div class="u2-question__options">${question.options.map((option, oi) => `<label><input type="radio" name="u3-question-${index}" value="${oi}" required><span>${escapeText(option)}</span></label>`).join('')}</div><div class="u2-question__feedback" data-quiz-feedback="${index}" hidden><p data-feedback-correct><strong>Feedback (correta):</strong> ${escapeText(question.feedback)}</p><p data-feedback-incorrect hidden><strong>Feedback (incorretas):</strong> ${escapeText(question.incorrectFeedback)}</p><p><strong>Objetivo relacionado:</strong> ${escapeText(question.objective)}</p></div></fieldset>`).join('')}
        <div class="u2-quiz__actions"><button class="u2-action" type="submit" data-quiz-submit>Enviar respostas</button><p class="u2-quiz__result" data-quiz-score hidden tabindex="-1" aria-live="polite"></p><button class="u2-action u2-action--secondary" type="reset" data-quiz-reset hidden>Refazer questionário</button></div>
    </form>`;
}

function configureDocuments(html) {
    return html.replace(/<a\b[^>]*data-unit-three-document="([^"]+)"[^>]*>/g, (tag, name) => {
        const url = appConfig.unitThreeDocuments[name];
        if (!url) return tag;
        return tag.replace('href="#"', `href="${escapeText(url)}"`).replace(/ aria-disabled="true"| tabindex="-1"| title="[^"]*"/g, '');
    });
}

const renderers = {pillars: () => accordion(ASHTANGA_PILLARS, true), benefits: () => accordion(BENEFIT_ACCORDION), map: () => slides(MAP_NODES, 'map', 'Mapa conceitual interativo', item => `<p>${escapeText(item.detail)}</p>`), meditation, matching, quiz, audio: audioResource};

export const unitThree = {
    slug: 'unidade-3',
    eyebrow: 'Unidade 3',
    title: 'Yoga e Meditação: filosofia, técnicas simples de respiração e relaxamento',
    bannerTitle: 'Unidade 3',
    bannerSubtitle: 'Yoga e Meditação: filosofia, técnicas simples de respiração e relaxamento',
    menuTitle: 'Conteúdo da Unidade 3',
    pages: unitThreeSourcePages.map((page, index) => ({title: page.title, className: `pagina-unidade-3 pagina-unidade-3--${index + 1}`, html: `<div class="u3-lesson u2-lesson">${page.sections.map(section => section.type === 'html' ? configureDocuments(section.content) : renderers[section.type]()).join('\n')}</div>`})),
};
