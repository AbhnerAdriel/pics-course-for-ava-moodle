/**
 * URLs opcionais do Moodle.
 * Substitua os valores vazios pelas URLs reais do fórum, da avaliação ou do formulário.
 */
export const appConfig = Object.freeze({
    forumUrl: '',
    unitOneAssessmentUrl: '',
    unitTwoForumUrl: '',
    unitThreeForumUrl: '',
    unitThreeMeditationAudioUrl: '',
    unitThreeDocuments: {
        'u3-mapa-evidencias-yoga.pdf': encodeURI('./assets/documents/unidade-3/MAPA DE EVIDÊNCIAS EFETIVIDADE CLÍNICA DA PRÁTICA DO YOGA.pdf'),
        'u3-asana-pranayama-mudra-bandha.pdf': encodeURI('./assets/documents/unidade-3/Asana Pranayama Mudra Bandha Complete Opt OCR.pdf'),
        'u3-yoga-para-nervosos.pdf': './assets/documents/unidade-3/02.-Yoga-para-nervosos-autor-Oswaldo-Paulino.pdf',
        'u3-mapa-evidencias-meditacao.pdf': encodeURI('./assets/documents/unidade-3/MAPA EVIDÊNCIAS MEDITAÇÃO.pdf'),
        'u3-arte-da-meditacao-goleman.pdf': './assets/documents/unidade-3/Daniel-Goleman-_-A-Arte-da-Meditacao.pdf',
    }, // PDFs compartilhados pelas aulas e pela biblioteca da Unidade 3.
    unitFourForumUrl: '',
    unitFourVideoUrl: '', // URL do VA4 finalizado (arquivo de vídeo ou URL de incorporação).
    welcomeFormUrl: '',
    storageKey: 'pics-spa:v1:progress',
    instanceId: '', // opcional: use um identificador único quando o mesmo pacote for reutilizado
});
