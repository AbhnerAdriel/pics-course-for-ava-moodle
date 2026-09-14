# Integração da Unidade 4

A unidade usa como fonte `unidade-04.zip`, especialmente `unidade-04/index.html`, `js/data.js` e `js/script.js`. As seis páginas e sua sequência foram mantidas: abertura e objetivos; grupos, oficinas, rodas de conversa e mutirões; aproximação e vínculo; relato de experiência; território e práticas populares; reflexão, prática, interação, avaliação, síntese e referências.

## Conteúdo e apresentação

`assets/js/data/units/unidade-4-content.js` contém os blocos do HTML de origem, com alterações somente na marcação de apresentação. `unidade-4-interactions.js` contém os sete tipos de grupos, os seis conceitos, os três roteiros, os quatro pares da associação e as cinco questões originais. `unidade-4.js` reúne esses conteúdos e registra as páginas.

O banner, o menu, a paginação e o progresso são os componentes existentes. A unidade reutiliza as estruturas de leitura, destaques, referências, abas e questionário da Unidade 2; `assets/css/unidade-4.css` aplica a mesma identidade visual e ajusta os componentes específicos sem mudar as demais unidades. A abertura utiliza a imagem da Unidade 4 já existente no projeto, com proporção original e descrição acessível.

Os grupos usam `details`, com o primeiro aberto. O mapa e os roteiros usam `bindContentSliders`, com seleção por botões, setas, Home e End. Os detalhes de cada roteiro mantêm o passo a passo em ordem. A página 6 tem navegação local pelos títulos originais para facilitar o acesso aos trechos extensos.

`bindUnitFourTools` implementa a associação por clique, teclado e arrastar/soltar, com reposicionamento dos termos, progresso, mensagens originais e reinício. A avaliação exige uma resposta para cada questão, usa o gabarito original e concede dois pontos por acerto. O feedback “Você acertou!” aparece somente nas respostas corretas; nas incorretas, a alternativa correta é identificada. Nenhum feedback didático foi inventado. A tentativa é preservada em `sessionStorage`, com reinício disponível. A nota é local e não é enviada ao livro de notas do Moodle.

Os estados das respostas têm indicação visual por símbolos e cores, além de atributos acessíveis. Os listeners e os atributos temporários são removidos/restaurados ao sair da rota.

## Materiais de apoio e recursos previstos

O ZIP menciona 15 PDFs, mas traz somente `docs/LEIA-ME.txt`. Os documentos correspondentes foram obtidos de suas fontes ou repositórios institucionais e anexados em `assets/documents/unidade-4/`. Todos os links continuam nos trechos e na sequência da fonte. `unidade-4-recursos.json` registra a origem, a edição, o tamanho, o SHA256 e a conferência de integridade/título de cada documento.

A HQ5, seu roteiro completo e a gravação VA4 não estão no ZIP. As notas de produção e as reservas de recursos não foram apresentadas ao aluno. Os dois links do Globoplay são referências originais e continuam identificados pelo texto original; não foram usados como se fossem a gravação VA4. A unidade está preparada para incorporar o vídeo final pela configuração `unitFourVideoUrl`, usando arquivo de vídeo ou URL de incorporação. O fórum usa `unitFourForumUrl`, com fallback para `forumUrl`; a URL da atividade deve ser informada em `assets/js/config.js`.

Os campos “[A DEFINIR]” de carga horária e “[A DEFINIR PELA COORDENAÇÃO DO CURSO]” de nota mínima permanecem como na fonte. A duração de 60 minutos do roteiro ACS e os tempos de suas etapas, que somam 130 minutos, também foram preservados, sem correção editorial.

## Verificação

`tests/fixtures/unit-four-source-text.json` registra os arquivos de origem e seus hashes, os 145 blocos/176 segmentos didáticos, os 88 textos dinâmicos, as cinco questões, as mensagens, os links e as notas editoriais separadas. `tests/unit-four-content.test.mjs` verifica fidelidade, ordem, ausência de duplicações indevidas, integração, referências de acessibilidade e os 15 PDFs. `tests/unit-four-tools.test.mjs` verifica avaliação, associação, reinício, recuperação, cleanup e navegação local.

As seis páginas foram conferidas no Chrome em 1366, 390 e 320 pixels, sem transbordamento horizontal nem imagens ausentes. Também foram conferidos o primeiro item aberto, as abas por teclado, os três roteiros, os quatro pares por clique/teclado/arraste, os estados de erro e acerto, a nota, os feedbacks, a recuperação da tentativa, o reinício, os atalhos locais e o card da Unidade 4 na página principal. Todos os 15 PDFs responderam corretamente pelo servidor local.
