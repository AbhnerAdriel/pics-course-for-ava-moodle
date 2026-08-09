# PICS — Módulo 01 (SPA para Moodle)

Esta versão reorganiza o projeto original como uma **Single Page Application sem dependências externas de JavaScript**. A navegação é feita por rotas com `#`, evitando a necessidade de regras de reescrita no servidor e mantendo compatibilidade com arquivos servidos pelo `pluginfile.php` do Moodle.

## Principais melhorias

- uma única página HTML e navegação sem recarregamento completo;
- rotas compartilháveis e compatíveis com voltar/avançar do navegador;
- cards de unidades disponíveis abertos em nova aba, sempre a partir da primeira página;
- indicador da página atual junto à paginação, sem progresso agregado na página principal;
- camada opcional para sincronização com um plugin Moodle;
- foco gerenciado, menu com bloqueio de foco, `aria-live`, skip-link e suporte a `prefers-reduced-motion`;
- imagens otimizadas em WebP e nomes de arquivos portáveis;
- JavaScript modular, sem jQuery, sem código inline e sem etapa obrigatória de build;
- testes automatizados do roteador, das visualizações e do registro de páginas visitadas.

## Executar localmente

```bash
npm start
```

Abra `http://localhost:8080`.

Para validar o pacote:

```bash
npm run check
```

## Publicar no Moodle como arquivo HTML

1. Compacte o conteúdo desta pasta, mantendo `index.html` na raiz.
2. No curso, adicione um recurso **Arquivo**.
3. Envie e descompacte o `.zip` na área de arquivos do recurso.
4. Defina `index.html` como arquivo principal.
5. Escolha a forma de exibição desejada, normalmente **Abrir** ou **Incorporar**.

As rotas têm o formato:

```text
#/unidade/introducao/pagina/1
#/unidade/boas-vindas/pagina/3
#/unidade/unidade-1/pagina/2
#/unidade/unidade-1/pagina/3
```

Por serem rotas com fragmento, o Moodle sempre entrega o mesmo `index.html` e não precisa conhecer as rotas internas.

## Configurar links externos

Edite `assets/js/config.js`. O campo `welcomeFormUrl`, por exemplo, recebe o endereço real do formulário no Moodle. Quando o mesmo pacote for reutilizado em contextos diferentes, defina também um `instanceId` único para separar o progresso local de cada instância.

## Integração futura com um plugin Moodle

A SPA dispara o evento `pics:progresschange` sempre que uma página é visitada. Um plugin pode também fornecer:

```js
window.PICSMoodleAdapter = {
    async saveProgress(detail) {
        // Chamar core/ajax ou outro adaptador definido pelo plugin.
    },
};
```

A aplicação continua funcionando mesmo quando esse adaptador não existe.

## Conteúdo disponível

O pacote contém conteúdo publicado para **Introdução**, **Boas-Vindas** e as três primeiras páginas da **Unidade 1**. A segunda página da Unidade 1 incorpora um flipbook interativo autocontido, disponível em `assets/flipbook`. A terceira página integra o componente visual de vídeo disponível em `assets/video`; o exemplo fornecido usa um iframe do `youtube-nocookie.com` e requer conexão com a internet para reprodução. As demais unidades permanecem visíveis no catálogo, mas marcadas como “Em breve”.
