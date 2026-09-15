# Integração da Unidade 3

Após a integração, por solicitação do usuário, foi removido da página 1 o bloco “Unidade 3 - Aula completa”, “Identificação da aula” e os campos Título, Unidade, Carga horária estimada e Descrição. Foram retirados os colchetes de “Acolhimento e contextualização” e adicionada a etiqueta “Introdução” à esquerda da linha superior. O inventário original do ZIP foi preservado, e a conferência considera essas alterações autorizadas.

A Unidade 3 foi implementada a partir de `C:\Users\UFPE\Downloads\unidade-03.zip`. Posteriormente, a avaliação da aprendizagem foi removida integralmente da página 5 por solicitação do usuário. “Referências e materiais complementares” passou a constituir a sexta página, e os colchetes desse título e de “Encerramento e continuidade” foram retirados.

As cinco páginas do rascunho foram mantidas na ordem original, com a nova separação das referências:

1. Yoga e Meditação: por onde começar?
2. Os fundamentos do Yoga
3. Meditação e benefícios combinados
4. Da teoria à prática: aplicação nas UBS
5. Refletir, praticar e encerrar
6. Referências e materiais complementares

O conteúdo fica em `assets/js/data/units/unidade-3-content.js` e os dados das interações em `unidade-3-interactions.js`. O módulo `unidade-3.js` adapta esses dados ao contrato de páginas do curso. A unidade está registrada em `course.js`, disponível na página inicial, no menu e na paginação, com acompanhamento de progresso pelo mecanismo existente.

A apresentação reutiliza os estilos de leitura, títulos, chamadas, abas e botões da Unidade 2. `assets/css/unidade-3.css` acrescenta os ajustes locais de composição e responsividade. Não foram modificados os conteúdos ou componentes das outras unidades.

## Fidelidade ao material

Os textos didáticos, títulos, termos, acentos, pontuação, referências, instruções e legendas foram mantidos. Os 164 segmentos estáticos estão inventariados em `tests/fixtures/unit-three-source-text.json`, junto com o hash do ZIP, os dados originais das seis estruturas interativas e as três questões efetivamente fornecidas.

As marcações de início/fim de página organizam a paginação. As instruções de produção `[ESPAÇO RESERVADO...]`, a indicação de inserção no Moodle, os marcadores de gabarito e as Partes 3 e 4 explicitamente identificadas como “Orientações pedagógicas - não é conteúdo do aluno” não foram apresentadas ao estudante. As anotações editoriais de proposta nova, de conferência da referência de Magalhães e de decisão sobre as questões ausentes foram separadas dos respectivos textos didáticos. As frases da atividade e do fórum foram preservadas. Os valores `[A DEFINIR]` e `[A DEFINIR PELA COORDENAÇÃO DO CURSO]` nos campos visíveis foram mantidos; não foram preenchidos por suposição.

## Interações e acessibilidade

- Oito passos do Ashtanga Yoga e cinco dimensões de benefícios em grupos de `details`, com apenas o primeiro item de cada grupo inicialmente aberto, conforme o padrão solicitado para o projeto.
- Mapa conceitual com cinco abas e passo a passo de meditação com oito abas, pelo slider existente, com setas, Home e End, relações ARIA e painéis disponíveis antes da inicialização.
- As figuras de Sukhasana e Shavasana vieram no ZIP e foram copiadas integralmente para `assets/images/unidades/unidade-03/`, mantendo suas proporções e legendas.
- Associação dos quatro primeiros passos por clique, teclado e arraste, sem repetir o mesmo termo em duas definições; indicação de acerto/erro e reinício.
- Navegação, foco, progresso, preferência por movimento reduzido e links configurados pelo mecanismo do curso.

## Recursos que não vieram no ZIP

Também não vieram os áudios de meditação guiada, a URL do fórum nem os cinco PDFs:

- `u3-mapa-evidencias-yoga.pdf`
- `u3-asana-pranayama-mudra-bandha.pdf`
- `u3-yoga-para-nervosos.pdf`
- `u3-mapa-evidencias-meditacao.pdf`
- `u3-arte-da-meditacao-goleman.pdf`

Os rótulos e referências dos materiais foram preservados. Os links de download desses arquivos ficam desativados enquanto não há arquivo ou URL real, evitando solicitações locais que retornariam 404. Os links externos originais para AVASUS e BVS permanecem disponíveis.

Em `assets/js/config.js`, configurar `unitThreeForumUrl`, `unitThreeMeditationAudioUrl` e `unitThreeDocuments`. O último é um objeto que relaciona os nomes acima a caminhos locais ou URLs reais. O fórum também aceita o `forumUrl` geral já existente. Nenhum áudio ou PDF fictício foi gerado.

## Verificação

`npm run check`: validação de recursos e testes automatizados. A suíte de conteúdo confere a remoção da avaliação, a nova página de referências, a sequência dos textos mantidos, ausência de duplicação dos parágrafos extensos, dados dinâmicos, arquivos das figuras, IDs e destinos ARIA.

Revisão em Chrome nas páginas e larguras de 1366, 390 e 320 pixels: sem transbordamento horizontal, imagens ausentes, erros de execução ou respostas locais 404. Foram verificados os grupos de details, as cinco abas do mapa, as oito etapas e duas figuras, navegação de abas por teclado, associação por teclado/clique/arraste e reinício.
