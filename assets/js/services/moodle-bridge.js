/**
 * Camada desacoplada para futura integração com um plugin Moodle.
 * O pacote estático funciona sozinho. Um plugin pode definir
 * window.PICSMoodleAdapter.saveProgress(detail) para persistir no banco.
 */
export class MoodleBridge {
    async progressChanged(detail) {
        window.dispatchEvent(new CustomEvent('pics:progresschange', {detail}));
        const adapter = window.PICSMoodleAdapter;
        if (adapter && typeof adapter.saveProgress === 'function') {
            try { await adapter.saveProgress(detail); } catch (error) { console.warn('Falha ao sincronizar progresso com o Moodle.', error); }
        }
    }
}
