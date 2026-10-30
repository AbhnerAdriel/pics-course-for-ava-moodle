import test from 'node:test';
import assert from 'node:assert/strict';
import {course, unitsBySlug} from '../assets/js/data/course.js';
import {renderUnit} from '../assets/js/views/unit-view.js';

test('aplica o sistema editorial em todas as páginas de conteúdo sem modificar os dados pedagógicos', () => {
    for (const unit of unitsBySlug.values()) {
        for (const [index, page] of unit.pages.entries()) {
            const rendered = renderUnit({course, unit, page: index + 1});
            assert.ok(rendered.includes(page.html), `${unit.slug}/${index + 1}: preserva o HTML de origem`);
            if (!/<pics-flipbook\b/i.test(page.html)) {
                assert.match(rendered, /<article id="pagina-conteudo"[^>]+data-content-design="editorial"/);
            }
        }
    }
});

test('preserva o layout de qualquer página com flipbook, inclusive em outras unidades e páginas novas', () => {
    const flipbooks = [...unitsBySlug.values()].flatMap(unit => unit.pages.filter(page => /<pics-flipbook\b/i.test(page.html)));
    assert.ok(flipbooks.length >= 3);
    const unit = {slug: 'nova-unidade', title: 'Nova unidade', bannerTitle: 'Unidade', bannerSubtitle: '', pages: flipbooks};
    for (const [index, page] of unit.pages.entries()) {
        const rendered = renderUnit({course, unit, page: index + 1});
        assert.doesNotMatch(rendered, /data-content-design|unit-section-rule|unit-callout/);
        assert.ok(rendered.includes(page.html));
    }
});
