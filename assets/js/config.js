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
    unitThreeDocuments: {}, // Mapear os cinco nomes de PDF do rascunho para URLs reais.
    unitFourForumUrl: '',
    unitFourVideoUrl: '', // URL do VA4 finalizado (arquivo de vídeo ou URL de incorporação).
    welcomeFormUrl: '',
    storageKey: 'pics-spa:v1:progress',
    instanceId: '', // opcional: use um identificador único quando o mesmo pacote for reutilizado
});
