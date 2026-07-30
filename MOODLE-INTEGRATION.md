# Integração com Moodle

## Modo atual: pacote HTML

O pacote pode ser publicado diretamente como recurso de arquivo. Nesse modo, a autenticação e a autorização são feitas pelo próprio Moodle antes de entregar o conteúdo. O progresso é local ao navegador.

## Modo avançado: plugin de atividade

Para gravar progresso por usuário no banco de dados, conclusão de atividade e relatórios, a interface pode ser incorporada a um plugin `mod_`. O plugin deve:

1. renderizar ou disponibilizar os arquivos estáticos da SPA;
2. definir `window.PICSMoodleAdapter.saveProgress` antes de `app.js` iniciar;
3. validar `course`, `cmid`, usuário e capacidade no servidor;
4. persistir `unitSlug`, `page`, `visitedPages`, `completed` e `updatedAt`;
5. atualizar a conclusão da atividade quando as regras forem atendidas.

Exemplo conceitual do adaptador:

```js
window.PICSMoodleAdapter = {
    async saveProgress(detail) {
        const Ajax = await import('core/ajax');
        return Ajax.call([{
            methodname: 'mod_picscontent_save_progress',
            args: {cmid: window.PICS_CMID, payload: JSON.stringify(detail)},
        }])[0];
    },
};
```

Esse trecho é apenas o contrato do front-end. A função externa, validação, tabela, privacidade e conclusão devem ser implementadas no plugin Moodle.
