import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeDetailsGroups} from '../assets/js/components/interactions.js';

test('inicia cada grupo de details com apenas o primeiro item aberto', () => {
    const risks = {};
    const glossary = {};
    const items = [
        {parentElement: risks, open: true},
        {parentElement: risks, open: true},
        {parentElement: risks, open: true},
        {parentElement: glossary, open: false},
        {parentElement: glossary, open: false},
    ];
    initializeDetailsGroups({querySelectorAll: () => items});
    assert.deepEqual(items.map((item) => item.open), [true, false, false, true, false]);
});

test('trata grupos aninhados separadamente e preserva details isolados', () => {
    const parent = {};
    const first = {parentElement: parent, open: false};
    const second = {parentElement: parent, open: true};
    const nestedFirst = {parentElement: first, open: false};
    const nestedSecond = {parentElement: first, open: true};
    const isolated = {parentElement: {}, open: false};
    const items = [first, nestedFirst, nestedSecond, second, isolated];
    initializeDetailsGroups({querySelectorAll: () => items});
    assert.deepEqual(items.map((item) => item.open), [true, true, false, false, false]);
});
