import test from 'node:test';
import assert from 'node:assert/strict';

class MemoryStorage {
    data = new Map();
    getItem(key) { return this.data.get(key) ?? null; }
    setItem(key, value) { this.data.set(key, String(value)); }
}

globalThis.window = {localStorage: new MemoryStorage()};
const {ProgressStore} = await import('../assets/js/core/store.js');

test('registra páginas visitadas sem duplicação', () => {
    const store = new ProgressStore({storage: new MemoryStorage(), key: 'test'});
    store.visit('intro', 1, 3);
    store.visit('intro', 1, 3);
    store.visit('intro', 2, 3);
    assert.deepEqual(store.getUnit('intro').visitedPages, [1, 2]);
    assert.equal('lastPage' in store.getUnit('intro'), false);
});

test('marca a unidade como concluída ao visitar todas as páginas', () => {
    const store = new ProgressStore({storage: new MemoryStorage(), key: 'test2'});
    [1, 2, 3].forEach((page) => store.visit('intro', page, 3));
    assert.equal(store.getUnit('intro').completed, true);
});

test('recalcula o progresso salvo quando uma nova página é adicionada à unidade', () => {
    const storage = new MemoryStorage();
    storage.setItem('test3', JSON.stringify({
        version: 1,
        units: {
            'unidade-1': {visitedPages: [1, 2], completed: true},
        },
    }));
    const store = new ProgressStore({storage, key: 'test3'});

    assert.equal(store.visit('unidade-1', 2, 3).completed, false);
    assert.equal(store.visit('unidade-1', 3, 3).completed, true);
});
