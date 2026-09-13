# Integração da Unidade 2

O conteúdo foi importado de `estrutura_unidade_02.zip`. Seus textos foram preservados nas páginas mantidas. A antiga página 7, de avaliação, foi removida a pedido do usuário. A unidade agora tem oito páginas: abertura, quatro aulas, fórum, referências (página 7) e biblioteca (página 8).

## Apresentação

O conteúdo está em `assets/js/data/units/unidade-2.js`, registrado em `course.js`. A unidade usa o mesmo banner, menu, paginação e progresso das unidades publicadas. A folha `assets/css/unidade-2.css` aplica à nova unidade a paleta, as fontes, os destaques e a iconografia da Unidade 1.

As aulas usam uma coluna de leitura com atalhos para seus trechos. A história das plantas medicinais e o protocolo da TCI usam `pics-horizontal-timeline`. Os benefícios do Lian Gong usam o slider de conteúdo já existente. As figuras possuem ampliação em diálogo, fechamento com Escape e retorno do foco ao botão. A biblioteca oferece os oito PDFs locais e links para os trechos correspondentes das aulas.

O infográfico “Plantas medicinais: uso seguro, orientações básicas e riscos do uso inadequado”, localizado na página 2, foi convertido em um carrossel de oito páginas. A transcrição está em `assets/js/data/units/plantas-uso-seguro.js`: coleta, partes da planta, secagem, preparo, armazenamento, doses e mofo, identificação e interações, e cuidados finais. O carrossel reutiliza `bindContentSliders` e a estrutura visual dos sliders existentes, com navegação por botões e teclado. Todos os textos da imagem e a legenda foram preservados; `tests/fixtures/plant-safety-image-text.json` registra a transcrição para verificação. Os oito slides foram conferidos no navegador em 1366, 390 e 320 pixels, sem transbordamento horizontal, incluindo navegação, teclado e retorno à rota.

Os oito documentos e as dez imagens de `docs/` e `images/` no ZIP foram copiados sem alteração para `assets/documents/unidade-2/` e `assets/images/unidades/unidade-02/`. A abertura também aproveita a imagem da Unidade 2 já presente no módulo.

## História em quadrinhos

O HTML do rascunho contém três `image-slot` vazios para as páginas da HQ. O estado salvo no ZIP inclui apenas imagens sobre plantas medicinais e TCI; não contém as páginas ilustradas da história.

Na página 5, a seção `u2-story` foi substituída a pedido do usuário pelo mesmo `pics-flipbook` da página 2 da Unidade 1, usando `assets/flipbook/pdf/HQ_page-0001.pdf`. O aviso “Mensagem-chave para ACS e ACE” foi preservado e aparece imediatamente abaixo do flipbook. O texto anterior e posterior à seção permanece intacto; o roteiro original continua registrado na fonte de verificação.

## Moodle e avaliação

O botão de acesso ao fórum usa `appConfig.unitTwoForumUrl`, em `assets/js/config.js`, com fallback para o `forumUrl` já existente. É necessário informar a URL real do fórum no Moodle para habilitar esse acesso.

A avaliação deixou de ser apresentada na unidade. Os dados originais das cinco questões e o gabarito permanecem preservados no código e na fonte de verificação.

## Verificação

`tests/fixtures/unit-two-source-text.json` registra os 168 blocos de texto visível extraídos do HTML original, os textos dos componentes dinâmicos, as cinco questões completas, o SHA-256 desse HTML e as falas e legendas recuperadas do roteiro. `tests/unit-two.test.mjs` confere a preservação desses textos, os recursos locais, as rotas e os trechos da biblioteca e o gabarito da avaliação.

Foram conferidos no navegador a navegação, o slider por teclado, a ampliação de imagem, o fechamento com Escape, a correção, a recuperação e o reinício da avaliação. A apresentação foi verificada em computador e em telas de 390 e 320 pixels de largura.
