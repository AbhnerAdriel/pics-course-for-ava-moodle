// Adapta o conteúdo legado aos componentes editoriais sem alterar textos, IDs ou ações.
const CALLOUTS = '.unit-callout, .pics-callout, .pagina-historico-pics__card, .conteudo-texto-corrido-bloco-depoimento';
const INTERACTIVE_HEADINGS = '.pics-policy-slider, .pics-horizontal-timeline, pics-horizontal-timeline, .pillar-stack, .pics-rights, .pics-glossary, .pics-keyfacts';
const BADGES = '.pics-section-kicker, .conteudo-texto-imagem-flex-tag, .formulario-atividade-tag, .pics-resource-hub__eyebrow, .pics-video__eyebrow-text';

function normalized(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function sectionLabel(title, fallback = 'Conteúdo') {
    const text = normalized(title);
    if (/referencia|biblioteca|material.*complementar/.test(text)) return 'Para consultar';
    if (/objetivo/.test(text)) return 'Nesta unidade';
    if (/reflex|quest|pausas/.test(text)) return 'Para refletir';
    if (/sintese|encerramento|conclu/.test(text)) return 'Para guardar';
    if (/pratica|vivencia|atuar|territorio/.test(text)) return 'Na prática';
    if (/beneficio|potencial|importancia|avanco/.test(text)) return 'Em destaque';
    if (/passo|protocolo|tecnica/.test(text)) return 'Passo a passo';
    return fallback;
}

function sectionRule(document, text) {
    const rule = document.createElement('div');
    rule.className = 'unit-section-rule';
    const badge = document.createElement('span');
    badge.className = 'unit-badge';
    badge.textContent = text;
    rule.append(badge);
    return rule;
}

function enhanceHeadings(article) {
    const document = article.ownerDocument;
    for (const rule of article.querySelectorAll('.u3-introduction__rule, .u4-introduction__rule')) {
        rule.classList.add('unit-section-rule');
        rule.firstElementChild?.classList.add('unit-badge');
    }
    for (const badge of article.querySelectorAll(BADGES)) {
        if (badge.closest(CALLOUTS) || badge.closest(INTERACTIVE_HEADINGS)) continue;
        // A vinheta do vídeo já inclui uma linha e um ícone próprios.
        if (badge.matches('.pics-video__eyebrow-text')) continue;
        badge.classList.add('unit-badge');
        if (badge.parentElement.matches('.unit-section-rule')) continue;
        const rule = document.createElement('div');
        rule.className = 'unit-section-rule';
        badge.before(rule);
        rule.append(badge);
    }

    const headings = article.querySelectorAll('h2, h3.u2-chapter, .conteudo-texto-corrido > h3, .u2-heading__title[role="heading"]');
    let index = 0;
    for (const heading of headings) {
        if (heading.matches('.visually-hidden, .sr-only') || heading.closest(CALLOUTS) || heading.closest(INTERACTIVE_HEADINGS)) continue;
        const fallback = index++ === 0
            ? (article.closest('[data-unit]')?.dataset.page === '1' ? 'Introdução' : 'Conteúdo')
            : 'Para explorar';
        heading.classList.add('unit-section-title');
        if (heading.parentElement.tagName === 'HEADER') heading.parentElement.classList.add('unit-section-header');
        if (heading.dataset.sectionRule === 'none') continue;
        // Reutiliza a etiqueta do cabeçalho, mesmo quando o título tem um ícone.
        const header = heading.closest('header');
        if (heading.previousElementSibling?.matches('.unit-section-rule') || header?.querySelector('.unit-section-rule, .pics-video__eyebrow')) continue;
        heading.before(sectionRule(document, sectionLabel(heading.textContent, fallback)));
    }
}

function enhanceCallouts(article) {
    for (const callout of article.querySelectorAll(CALLOUTS)) {
        callout.classList.add('unit-callout');
        if (!callout.dataset.callout) {
            const label = callout.querySelector('.pics-callout__label, .u2-callout__copy > p, h2, h3')?.textContent || '';
            const kind = normalized(`${callout.className} ${label}`);
            callout.dataset.callout = /attention|atencao|cuidado|risco/.test(kind) ? 'attention'
                : /reflection|reflexao|refletir|pergunta/.test(kind) ? 'reflection'
                : /lembrete|lembrar/.test(kind) ? 'reminder'
                : /curiosidade|voce sabia/.test(kind) ? 'curiosity'
                : /novidade|novo/.test(kind) ? 'news' : 'information';
        }
        callout.querySelector('.pics-callout__label, .u2-callout__copy > p, h2, h3')?.classList.add('unit-callout__label');
    }
}

function enhanceMedia(article) {
    for (const figure of article.querySelectorAll('figure.conteudo-figura, .u2-opening__image, .u3-opening-image, .u4-opening-image, .u3-posture')) {
        figure.classList.add('unit-media');
    }
    // Nas páginas antigas de leitura, aproxima a imagem do parágrafo correspondente.
    // Só agrupa vizinhos diretos, preservando os limites de cada seção e a ordem de leitura.
    let index = 0;
    for (const figure of article.querySelectorAll('.conteudo-texto-corrido > .conteudo-texto-corrido-imagem')) {
        const copy = figure.previousElementSibling;
        if (copy?.tagName !== 'P' || copy.matches('.conteudo-figura-titulo')) continue;
        const row = article.ownerDocument.createElement('div');
        row.className = `unit-media-row${index++ % 2 === 0 ? ' unit-media-row--image-left' : ''}`;
        copy.before(row);
        row.append(copy, figure);
    }
}

export function enhanceUnitContent(root = document) {
    const article = root.querySelector('#pagina-conteudo[data-content-design="editorial"]');
    if (!article || article.dataset.contentEnhanced === 'true') return;
    enhanceCallouts(article);
    enhanceHeadings(article);
    enhanceMedia(article);
    article.dataset.contentEnhanced = 'true';
}
