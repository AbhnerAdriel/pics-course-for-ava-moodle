# Sistema de design do conteúdo das unidades

O padrão segue as referências de acolhimento das unidades 3 e 4: uma superfície branca, verde profundo nos títulos e etiquetas, divisórias em ocre, formas orgânicas quase transparentes e destaques sobre fundos claros. As variações mantêm essa mesma linguagem.

## Escopo e integração

Aplica-se às páginas de apresentação, boas-vindas e unidades 1 a 4, incluindo novas páginas renderizadas por `renderUnit`. Não se aplica à página inicial, à biblioteca geral, ao banner, à navegação, ao rodapé ou às páginas que contêm `<pics-flipbook>`.

- `assets/css/unit-content.css`: tokens e componentes, carregados depois dos estilos existentes.
- `assets/js/components/unit-content.js`: adapta a marcação antiga antes de inicializar as interações. Preserva textos, IDs, links, fontes, legendas, botões e atributos ARIA. A adaptação é idempotente.
- `assets/js/views/unit-view.js`: habilita o padrão com `data-content-design="editorial"` no artigo. O atributo é omitido automaticamente quando há um flipbook, independentemente da unidade ou da classe da página.

Não usar os estilos editoriais em `:root`, `body` ou em seletores sem o escopo do artigo. Os componentes interativos existentes continuam responsáveis pelos seus painéis, controles e estados.

## Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `--unit-green` | `#0a5d43` | Títulos, badges e detalhes principais |
| `--unit-leaf` | `#81ae2e` | Borda de informações e marcadores |
| `--unit-ochre` | `#bb811d` | Linhas de seção e reflexão |
| `--unit-ink` | `#253c34` | Texto de leitura |
| `--unit-muted` | `#536c5e` | Legendas e fontes |
| `--unit-paper` | `#f7f6f0` | Fundos de destaque |
| `--unit-line` | Verde a 20% | Divisórias discretas |
| `--unit-radius` | `4px 32px 4px 32px` | Cantos assimétricos das imagens |
| `--unit-space` | `24–40px` | Distância entre blocos |
| `--unit-section-space` | `40–68px` | Separação entre seções |
| `--unit-body-size` | `17–20px` | Texto de leitura |

Os tokens `--pics-*` antigos recebem esses valores dentro do artigo para manter a compatibilidade com os componentes das unidades.

## Leitura e hierarquia

Texto de leitura justificado, com hifenização em português e recuo de primeira linha de `1.5–2.5rem`. Entrelinha de 1.8 e distância clara entre parágrafos. Etiquetas, títulos, legendas, fontes e metadados ficam alinhados à esquerda, sem recuo. Listas mantêm alinhamento à esquerda.

Use um título principal e subtítulos por assunto. Cada seção recebe uma etiqueta curta e uma linha ocre flexível. Evite repetir o título inteiro na etiqueta. Categorias possíveis: Introdução, Para explorar, Nesta unidade, Na prática, Em destaque, Passo a passo, Para refletir, Para guardar e Para consultar.

Para omitir a geração automática da etiqueta e da linha em um título específico, acrescente `data-section-rule="none"` ao título. A tipografia do título é preservada.

```html
<header class="unit-section-header">
    <div class="unit-section-rule">
        <span class="unit-badge">Na prática</span>
    </div>
    <h2 class="unit-section-title" id="titulo-da-secao">Cuidado no território</h2>
</header>
<div class="unit-prose">
    <p>Texto da seção, preservando o conteúdo pedagógico.</p>
    <p>Um novo parágrafo para desenvolver a ideia seguinte.</p>
</div>
```

## Imagens

As fotografias mantêm a proporção original. Título da figura e fonte ficam fora da imagem, sem sobreposição. Não transformar imagens informativas em fundos ou cortar diagramas. Ícones de caixas e controles não recebem o tratamento de fotografia.

Há três composições compatíveis:

1. Imagem centralizada, em uma coluna, entre os parágrafos.
2. Texto à esquerda e imagem à direita: `unit-media-row`.
3. Imagem à esquerda e texto à direita: acrescentar `unit-media-row--image-left`.

```html
<div class="unit-media-row unit-media-row--image-left">
    <div class="unit-prose"><p>Texto relacionado diretamente à imagem.</p></div>
    <figure class="unit-media">
        <img src="./assets/images/exemplo.webp" alt="Descrição do que a figura comunica"
            width="960" height="640" loading="lazy" decoding="async">
        <figcaption>Figura e fonte da imagem.</figcaption>
    </figure>
</div>
```

Em telas de até 800px, as composições passam a uma coluna e seguem a ordem do HTML: texto e depois imagem. Não usar ordem visual para transmitir uma sequência pedagógica que dependa da posição da imagem.

## Caixas de destaque

Todas compartilham fundo suave, borda esquerda de 4px, cantos assimétricos e o mesmo ritmo de leitura. Variar apenas o acento e o fundo conforme a intenção. O rótulo deve identificar a intenção também por texto, sem depender apenas da cor.

| `data-callout` | Intenção / rótulo sugerido | Acento | Fundo |
| --- | --- | --- | --- |
| `information` | Saiba mais / Em destaque | Verde folha | `#f7f6f0` |
| `attention` | Atenção | Terracota `#a44732` | `#fbf4f0` |
| `reflection` | Para refletir | Ocre | `#faf7ed` |
| `reminder` | Lembrete | Oliva `#72834b` | `#f5f7ef` |
| `curiosity` | Você sabia? | Verde `#32796e` | `#f0f7f4` |
| `news` | Novidade | Verde profundo | `#edf5ed` |

```html
<aside class="unit-callout" data-callout="reflection" aria-labelledby="reflexao-titulo">
    <h3 class="unit-callout__label" id="reflexao-titulo">Para refletir</h3>
    <p>Uma pergunta relacionada ao conteúdo estudado.</p>
</aside>
```

Ícones existentes podem acompanhar o texto, com `alt=""` quando forem decorativos. Nas caixas antigas, o adaptador identifica o propósito pelo rótulo e pelas classes existentes; em conteúdo novo, prefira declarar `data-callout` explicitamente. Não inventar avisos clínicos, novidades ou informações para preencher uma variante: cada caixa deve refletir o conteúdo disponível.

## Limites das variações

- Manter fundos brancos e claros; usar cores sólidas principalmente nas pequenas etiquetas.
- Usar linhas finas, formas de baixa opacidade e espaço em branco; evitar sombras fortes e cartões sobre cartões.
- Alternar a posição das imagens conforme o assunto, preservando proporção, legenda e fonte.
- Manter foco visível, IDs e relações ARIA; não converter controles em elementos decorativos.
- Na impressão, remover sombras e formas de fundo. Em alto contraste, manter bordas e rótulos identificáveis.
- Preservar integralmente a apresentação das páginas de flipbook, incluindo sua introdução e seus controles.
