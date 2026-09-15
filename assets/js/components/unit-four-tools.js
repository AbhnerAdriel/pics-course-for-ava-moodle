import {appConfig} from '../config.js';
import {matchingTerms, matchingTargets, unitFourMessages} from '../data/units/unidade-4-interactions.js';

const activeBindings = new WeakMap();


export function evaluateUnitFourMatches(matches) {
    if (!matches || typeof matches !== 'object' || Array.isArray(matches) ||
        Object.entries(matches).some(([target, term]) => !matchingTargets.some((item) => item.id === target) || !matchingTerms.some((item) => item.id === term))) return null;
    const correct = matchingTargets.map((target) => matchingTerms.some((term) => term.id === matches[target.id] && term.targetId === target.id));
    const correctCount = correct.filter(Boolean).length;
    const total = matchingTargets.length;
    const complete = matchingTargets.every((target) => Object.hasOwn(matches, target.id));
    return {correct, correctCount, total, complete, allCorrect: complete && correctCount === total};
}

function remember(element, attributes = [], properties = []) {
    if (!element) return () => {};
    const initialAttributes = attributes.map((name) => [name, element.getAttribute(name)]);
    const initialProperties = properties.map((name) => [name, element[name]]);
    return () => {
        initialAttributes.forEach(([name, value]) => value === null ? element.removeAttribute(name) : element.setAttribute(name, value));
        initialProperties.forEach(([name, value]) => { element[name] = value; });
    };
}

function bindMatching(activity) {
    const terms = [...activity.querySelectorAll('button[data-matching-term]')];
    const targets = [...activity.querySelectorAll('button[data-matching-target]')];
    const progress = activity.querySelector('[data-matching-progress]');
    const result = activity.querySelector('[data-matching-result]');
    const reset = activity.querySelector('[data-matching-reset]');
    if (terms.length !== matchingTerms.length || targets.length !== matchingTargets.length || !progress || !result || !reset || targets.some((target) => !target.querySelector('[data-matched-label]'))) return () => {};

    const restore = [remember(progress, ['aria-live'], ['innerHTML']), remember(result, ['data-matching-state'], ['hidden', 'innerHTML'])];
    terms.forEach((term) => restore.push(remember(term, ['aria-pressed', 'draggable', 'data-matching-placed'])));
    const originalTargetLabels = new Map(targets.map((target) => [target, target.getAttribute('aria-label')]));
    targets.forEach((target) => {
        restore.push(remember(target, ['data-matching-state', 'data-matching-drag-over', 'aria-label']));
        restore.push(remember(target.querySelector('[data-matched-label]'), [], ['innerHTML']));
    });
    let matches = {};
    let selectedTerm = null;
    let draggingTerm = null;
    progress.setAttribute('aria-live', 'polite');
    terms.forEach((term) => term.setAttribute('draggable', 'true'));

    const render = () => {
        terms.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.dataset.matchingTerm === selectedTerm));
            button.setAttribute('data-matching-placed', String(Object.values(matches).includes(button.dataset.matchingTerm)));
        });
        targets.forEach((button) => {
            const term = matchingTerms.find((item) => item.id === matches[button.dataset.matchingTarget]);
            button.querySelector('[data-matched-label]').textContent = term?.label || unitFourMessages.matchingPlaceholder;
            button.setAttribute('data-matching-state', term ? (term.targetId === button.dataset.matchingTarget ? 'correct' : 'incorrect') : 'empty');
            if (term) {
                const description = matchingTargets.find((target) => target.id === button.dataset.matchingTarget).description;
                const state = term.targetId === button.dataset.matchingTarget ? 'associação correta' : 'associação incorreta';
                button.setAttribute('aria-label', `${term.label} — ${description} — ${state}`);
            } else {
                const originalLabel = originalTargetLabels.get(button);
                if (originalLabel === null) button.removeAttribute('aria-label');
                else button.setAttribute('aria-label', originalLabel);
            }
        });
        const grade = evaluateUnitFourMatches(matches);
        const score = `${grade.correctCount} / ${grade.total} ${unitFourMessages.matchingProgressSuffix}`;
        progress.textContent = score;
        result.hidden = !grade.complete;
        result.setAttribute('data-matching-state', grade.allCorrect ? 'success' : 'pending');
        result.textContent = grade.complete ? `${score}\n${grade.allCorrect ? unitFourMessages.matchingSuccess : unitFourMessages.matchingRetry}` : '';
    };

    const assign = (targetId, termId) => {
        if (!matchingTargets.some((target) => target.id === targetId) || !matchingTerms.some((term) => term.id === termId)) return;
        Object.keys(matches).forEach((id) => { if (matches[id] === termId) delete matches[id]; });
        matches[targetId] = termId;
        selectedTerm = null;
        draggingTerm = null;
        render();
    };
    const ownControl = (event, selector) => {
        const control = event.target.closest?.(selector);
        return control && activity.contains(control) ? control : null;
    };
    const onClick = (event) => {
        if (ownControl(event, '[data-matching-reset]')) {
            matches = {};
            selectedTerm = null;
            draggingTerm = null;
            render();
            terms[0].focus({preventScroll: true});
            return;
        }
        const term = ownControl(event, 'button[data-matching-term]');
        if (term) {
            selectedTerm = selectedTerm === term.dataset.matchingTerm ? null : term.dataset.matchingTerm;
            render();
            return;
        }
        const target = ownControl(event, 'button[data-matching-target]');
        if (target && selectedTerm) assign(target.dataset.matchingTarget, selectedTerm);
    };
    const onKeydown = (event) => {
        if (event.key !== 'Escape' || !selectedTerm) return;
        selectedTerm = null;
        render();
        event.preventDefault();
    };
    const onDragstart = (event) => {
        const term = ownControl(event, 'button[data-matching-term]');
        if (!term) return;
        draggingTerm = term.dataset.matchingTerm;
        selectedTerm = draggingTerm;
        event.dataTransfer?.setData('text/plain', draggingTerm);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        render();
    };
    const clearDragState = () => targets.forEach((target) => target.removeAttribute('data-matching-drag-over'));
    const onDragover = (event) => {
        const target = ownControl(event, 'button[data-matching-target]');
        if (!target || !draggingTerm) return;
        event.preventDefault();
        target.setAttribute('data-matching-drag-over', 'true');
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    };
    const onDragleave = (event) => ownControl(event, 'button[data-matching-target]')?.removeAttribute('data-matching-drag-over');
    const onDrop = (event) => {
        const target = ownControl(event, 'button[data-matching-target]');
        if (!target || !draggingTerm) return;
        event.preventDefault();
        clearDragState();
        assign(target.dataset.matchingTarget, draggingTerm);
    };
    const onDragend = () => {
        draggingTerm = null;
        selectedTerm = null;
        clearDragState();
        render();
    };
    const listeners = {click: onClick, keydown: onKeydown, dragstart: onDragstart, dragover: onDragover, dragleave: onDragleave, drop: onDrop, dragend: onDragend};
    Object.entries(listeners).forEach(([type, listener]) => activity.addEventListener(type, listener));
    render();
    return () => {
        Object.entries(listeners).forEach(([type, listener]) => activity.removeEventListener(type, listener));
        restore.forEach((undo) => undo());
    };
}


export function bindUnitFourTools(root = document) {
    const unit = root.matches?.('[data-unit="unidade-4"]') ? root : root.querySelector('[data-unit="unidade-4"]');
    if (!unit) return () => {};
    activeBindings.get(unit)?.();
    const cleanups = [];
    unit.querySelectorAll('[data-unit-four-matching]').forEach((activity) => cleanups.push(bindMatching(activity)));
    if (unit.querySelectorAll('[data-unit-four-reading]').length) {
        const readingTargets = new Map();
        const onReadingClick = (event) => {
            const button = event.target.closest?.('[data-unit-four-reading]');
            if (!button || !unit.contains(button)) return;
            const target = [...unit.querySelectorAll('[id]')].find((element) => element.id === button.dataset.unitFourReading);
            if (!target) return;
            if (target.getAttribute('tabindex') === null) {
                if (!readingTargets.has(target)) readingTargets.set(target, remember(target, ['tabindex']));
                target.setAttribute('tabindex', '-1');
            }
            target.focus({preventScroll: true});
            const reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? true;
            target.scrollIntoView({block: 'start', behavior: reducedMotion ? 'auto' : 'smooth'});
        };
        unit.addEventListener('click', onReadingClick);
        cleanups.push(() => {
            unit.removeEventListener('click', onReadingClick);
            readingTargets.forEach((undo) => undo());
        });
    }
    let cleaned = false;
    const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        cleanups.forEach((unbind) => unbind());
        if (activeBindings.get(unit) === cleanup) activeBindings.delete(unit);
    };
    activeBindings.set(unit, cleanup);
    return cleanup;
}
