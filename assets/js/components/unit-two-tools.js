import {unitTwoQuestions} from '../data/units/unidade-2.js';
import {appConfig} from '../config.js';

let readingDestination = null;

export function takeReadingDestination(root = document) {
    const target = readingDestination ? root.getElementById(readingDestination) : null;
    readingDestination = null;
    return target;
}

export function evaluateUnitTwoAnswers(answers) {
    if (!Array.isArray(answers) || answers.length !== unitTwoQuestions.length ||
        Array.from(answers).some((answer, index) => !Number.isInteger(answer) || answer < 0 || answer >= unitTwoQuestions[index].options.length)) {
        return null;
    }
    const correct = answers.map((answer, index) => answer === unitTwoQuestions[index].correctIndex);
    return {correct, score: correct.filter(Boolean).length * 2, total: unitTwoQuestions.length * 2};
}

function bindQuiz(form) {
    const storageKey = `${appConfig.storageKey}:${appConfig.instanceId}:unit-two-quiz`;
    const fields = [...form.querySelectorAll('fieldset')];
    const result = form.querySelector('[data-quiz-result]');
    const submit = form.querySelector('[type="submit"]');
    const reset = form.querySelector('[type="reset"]');
    let submitted = false;

    const readAnswers = () => fields.map((field) => {
        const selected = field.querySelector('input:checked');
        return selected ? Number(selected.value) : null;
    });

    const save = () => {
        try { sessionStorage.setItem(storageKey, JSON.stringify({answers: readAnswers(), submitted})); } catch { /* Storage is optional. */ }
    };

    const showGrade = (grade) => {
        submitted = true;
        fields.forEach((field, index) => {
            field.disabled = true;
            const feedback = field.querySelector('[data-question-feedback]');
            const question = unitTwoQuestions[index];
            feedback.textContent = grade.correct[index] ? 'Resposta correta.' : question.feedback;
            feedback.hidden = false;
            field.dataset.correct = String(grade.correct[index]);
            field.querySelectorAll('label').forEach((label, optionIndex) => {
                if (optionIndex === question.correctIndex) label.dataset.answer = 'correct';
                else if (label.querySelector('input').checked) label.dataset.answer = 'incorrect';
            });
        });
        result.textContent = `Resultado: ${grade.score} / ${grade.total} pontos`;
        result.hidden = false;
        submit.hidden = true;
        reset.hidden = false;
    };

    try {
        const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
        if (Array.isArray(saved?.answers) && saved.answers.length === fields.length) {
            fields.forEach((field, index) => {
                const value = saved.answers[index];
                if (Number.isInteger(value) && value >= 0 && value < unitTwoQuestions[index].options.length) {
                    field.querySelector(`input[value="${value}"]`).checked = true;
                }
            });
            const grade = saved.submitted && evaluateUnitTwoAnswers(saved.answers);
            if (grade) showGrade(grade);
        }
    } catch { /* Ignore unavailable storage or invalid saved attempts. */ }

    const onSubmit = (event) => {
        event.preventDefault();
        if (submitted || !form.reportValidity()) return;
        const grade = evaluateUnitTwoAnswers(readAnswers());
        if (!grade) return;
        showGrade(grade);
        save();
        result.focus({preventScroll: true});
        result.scrollIntoView({block: 'center', behavior: 'auto'});
    };
    const onReset = () => {
        submitted = false;
        fields.forEach((field) => {
            field.disabled = false;
            delete field.dataset.correct;
            field.querySelector('[data-question-feedback]').hidden = true;
            field.querySelectorAll('label').forEach((label) => delete label.dataset.answer);
        });
        result.hidden = true;
        submit.hidden = false;
        reset.hidden = true;
        try { sessionStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
        fields[0].querySelector('input').focus({preventScroll: true});
        fields[0].scrollIntoView({block: 'start', behavior: 'auto'});
    };
    form.addEventListener('submit', onSubmit);
    form.addEventListener('change', save);
    form.addEventListener('reset', onReset);
    return () => {
        form.removeEventListener('submit', onSubmit);
        form.removeEventListener('change', save);
        form.removeEventListener('reset', onReset);
    };
}

export function bindUnitTwoTools(root = document) {
    const unit = root.querySelector('[data-unit="unidade-2"]');
    if (!unit) return () => {};
    const cleanups = [];
    const form = unit.querySelector('[data-unit-two-quiz]');
    if (form) cleanups.push(bindQuiz(form));

    let dialog = null;
    let zoomTrigger = null;
    const onClick = (event) => {
        const relatedLink = event.target.closest('[data-reading-destination]');
        if (relatedLink && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
            readingDestination = relatedLink.dataset.readingDestination;
        }
        const jump = event.target.closest('[data-reading-target]');
        if (jump) {
            const target = root.getElementById(jump.dataset.readingTarget);
            if (target) {
                target.tabIndex = -1;
                target.focus({preventScroll: true});
                target.scrollIntoView({block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
            }
        }
        const zoom = event.target.closest('[data-reading-zoom]');
        if (!zoom) return;
        const figure = zoom.closest('figure');
        const originalImage = figure?.querySelector('img');
        if (!originalImage) return;
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.className = 'u2-image-dialog';
            dialog.setAttribute('aria-label', 'Imagem ampliada');
            const close = document.createElement('button');
            close.type = 'button';
            close.className = 'u2-action';
            close.textContent = 'Fechar imagem';
            close.addEventListener('click', () => dialog.close());
            dialog.append(close, document.createElement('figure'));
            dialog.addEventListener('click', (click) => { if (click.target === dialog) dialog.close(); });
            dialog.addEventListener('close', () => {
                document.documentElement.classList.remove('u2-zoom-open');
                zoomTrigger?.focus({preventScroll: true});
            });
            unit.append(dialog);
        }
        const image = originalImage.cloneNode();
        image.loading = 'eager';
        const enlargedFigure = dialog.querySelector('figure');
        enlargedFigure.replaceChildren(image);
        const caption = figure.querySelector('figcaption');
        if (caption) enlargedFigure.append(caption.cloneNode(true));
        zoomTrigger = zoom;
        document.documentElement.classList.add('u2-zoom-open');
        dialog.showModal();
    };
    unit.addEventListener('click', onClick);
    cleanups.push(() => {
        unit.removeEventListener('click', onClick);
        dialog?.remove();
        document.documentElement.classList.remove('u2-zoom-open');
    });
    return () => cleanups.forEach((cleanup) => cleanup());
}
