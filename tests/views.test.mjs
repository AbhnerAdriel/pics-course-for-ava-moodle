import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {course, unitsBySlug} from '../assets/js/data/course.js';
import {renderHome} from '../assets/js/views/home-view.js';
import {renderUnit} from '../assets/js/views/unit-view.js';

test('renderiza a página principal sem indicadores de progresso', () => {
    const html = renderHome({course});
    assert.match(html, /data-view="home"/);
    assert.match(html, /#\/unidade\/introducao\/pagina\/1/);
    assert.doesNotMatch(html, /<progress\b|curso-progresso|unidade-card-progresso|Continuar/);
    assert.doesNotMatch(html, /\.\/unidade\/introducao\/conteudo\.html/);
});

test('abre cards disponíveis em nova aba e preserva as demais unidades em preparação', () => {
    const html = renderHome({course});
    const availableCardLinks = html.match(/class="unidade-card-link"/g) || [];
    const preparingCard = html.match(/<article class="unidade-card"[^>]*aria-labelledby="unit-unidade-2-title">[\s\S]*?<\/article>/)?.[0] || '';

    assert.equal(availableCardLinks.length, 3);
    assert.match(html, /class="unidade-card-link" href="#\/unidade\/introducao\/pagina\/1" target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /aria-label="Acessar Apresentação em nova aba"/);
    assert.match(html, /class="unidade-card-link" href="#\/unidade\/unidade-1\/pagina\/1" target="_blank" rel="noopener noreferrer"/);
    assert.match(html, /aria-label="Acessar Introdução às PICS no SUS: princípios e bases legais em nova aba"/);
    assert.match(preparingCard, /Conteúdo em preparação/);
    assert.match(preparingCard, /aria-disabled="true"/);
    assert.match(preparingCard, /Em breve/);
    assert.doesNotMatch(preparingCard, /<a\b|target="_blank"/);
});

test('renderiza unidade e página de conteúdo', () => {
    const unit = unitsBySlug.get('boas-vindas');
    const html = renderUnit({course, unit, page: 2});
    assert.match(html, /data-unit="boas-vindas"/);
    assert.match(html, /Prazer em Conhecê-lo/);
    assert.match(html, /Página 2 de 3/);
    assert.match(html, /boas-vindas-ao-pics\.webp/);
    assert.match(html, /role="progressbar"/);
    assert.match(html, /aria-valuenow="67"/);
    assert.doesNotMatch(html, /\.\.\/\.\.\/assets/);
});

test('renderiza a primeira página da Unidade 1 com o texto e as três figuras informadas', () => {
    const unit = unitsBySlug.get('unidade-1');
    const html = renderUnit({course, unit, page: 1});

    assert.match(html, /data-unit="unidade-1"/);
    assert.match(html, /O que são as Práticas Integrativas e Complementares em Saúde \(PICS\)/);
    assert.match(html, /Nesta primeira aula, você conhecerá as Práticas Integrativas e Complementares em Saúde/);
    assert.match(html, /Ao longo da narrativa, você conhecerá personagens com diferentes histórias/);
    assert.match(html, /Durante a leitura, observe como o diálogo entre profissionais, comunidade e saberes populares/);
    assert.match(html, /Ao concluir esta aula, você terá uma visão inicial sobre o que são as PICS/);
    assert.match(html, /figura-01-unidade-01\.webp/);
    assert.match(html, /figura-02-unidade-01\.webp/);
    assert.match(html, /figura-03-unidade-01\.webp/);
    assert.match(html, /Figura 8 – Momento coletivo de relaxamento/);
    assert.match(html, /Figura 9 – Atendimento individual com aplicação tópica/);
    assert.match(html, /Figura 10 – Encontro entre equipe de saúde e comunidade/);
    assert.match(html, /Página 1 de 8/);
    assert.match(html, /aria-valuenow="13"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/2"/);
    assert.doesNotMatch(html, /data-pics-video|<iframe\b/);
});

test('renderiza o flipbook integrado como a segunda página da Unidade 1', () => {
    const unit = unitsBySlug.get('unidade-1');
    const html = renderUnit({course, unit, page: 2});
    const flipbooks = html.match(/<pics-flipbook\b/g) || [];

    assert.equal(unit.pages.length, 8);
    assert.equal(flipbooks.length, 1);
    assert.match(html, /data-unit="unidade-1" data-page="2"/);
    assert.match(html, /class="pagina-conteudo pagina-flipbook-interativo"/);
    assert.match(html, /class="flipbook-introducao"/);
    assert.match(html, /Conteúdo complementar/);
    assert.match(html, /<h2 id="unidade-1-pagina-2-titulo" class="flipbook-introducao-titulo">O que são Práticas Integrativas e Complementares em Saúde \(PICS\)<\/h2>/);
    assert.match(html, /Explore o material abaixo para aprofundar sua compreensão sobre as Práticas Integrativas e Complementares em Saúde \(PICS\)\./);
    assert.match(html, /src="\.\/assets\/flipbook\/pdf\/HQ_page-0001\.pdf"/);
    assert.match(html, /title="O que são Práticas Integrativas e Complementares em Saúde \(PICS\)"/);
    assert.match(html, /class="flipbook-reflexao"/);
    assert.match(html, /<strong>Para refletir:<\/strong> durante a leitura, identifique quais práticas de cuidado são apresentadas e como elas podem contribuir para a promoção da saúde, o autocuidado e o cuidado integral\./);
    assert.doesNotMatch(html, /Não consigo dormir|pensamentos, gentileza e respiração|pensamentos e emoções/);
    assert.match(html, /Página 2 de 8/);
    assert.match(html, /aria-valuenow="25"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/1"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/3"/);
    assert.doesNotMatch(html, /<iframe\b/);
    assert.doesNotMatch(html, /demo-content|demo-after/);
});

test('renderiza o componente de vídeo como a terceira página da Unidade 1', () => {
    const unit = unitsBySlug.get('unidade-1');
    const html = renderUnit({course, unit, page: 3});
    const sections = html.match(/<section class="pics-video"/g) || [];
    const iframes = html.match(/<iframe\b/g) || [];
    const eyebrow = html.match(/<div class="pics-video__eyebrow"[^>]*>[\s\S]*?<\/div>/)?.[0] || '';
    const expectedTitle = 'Abordagens de cuidado integral focadas na pessoa e seus aspectos biopsicossociais';

    assert.equal(unit.pages.length, 8);
    assert.equal(unit.pages[2].title, expectedTitle);
    assert.equal(sections.length, 1);
    assert.equal(iframes.length, 1);
    assert.match(html, /data-unit="unidade-1" data-page="3"/);
    assert.match(html, /class="pagina-conteudo pagina-video-interativo"/);
    assert.match(html, /<article[^>]+aria-label="Abordagens de cuidado integral focadas na pessoa e seus aspectos biopsicossociais"/);
    assert.match(html, /data-pics-video aria-labelledby="unidade-1-pagina-3-titulo"/);
    assert.match(html, /<h2 class="pics-video__title" id="unidade-1-pagina-3-titulo">\s*Abordagens de cuidado integral focadas na pessoa e seus aspectos biopsicossociais\s*<\/h2>/);
    assert.match(html, /aria-label="Ir para a página 3: Abordagens de cuidado integral focadas na pessoa e seus aspectos biopsicossociais"/);
    assert.match(eyebrow, /class="pics-video__eyebrow-icon"/);
    assert.match(eyebrow, /<svg\b[^>]*focusable="false"/);
    assert.doesNotMatch(eyebrow, />\s*01\s*</);
    assert.doesNotMatch(html, /Práticas integrativas no cuidado em saúde|pics-video__eyebrow-index/);
    assert.match(html, /Assista ao vídeo a seguir para aprofundar os conceitos apresentados nesta unidade/);
    assert.match(html, /src="https:\/\/www\.youtube-nocookie\.com\/embed\/M7lc1UVf-VE\?rel=0"/);
    assert.match(html, /title="Vídeo de exemplo do YouTube"/);
    assert.match(html, /loading="lazy"/);
    assert.match(html, /referrerpolicy="strict-origin-when-cross-origin"/);
    assert.match(html, /allowfullscreen/);
    assert.match(html, /Material audiovisual da unidade/);
    assert.match(unit.pages[2].html, /<\/iframe>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div class="pics-video__caption">/);
    assert.doesNotMatch(html, /pics-video__corner/);
    assert.match(html, /Página 3 de 8/);
    assert.match(html, /aria-valuenow="38"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/2"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/4"/);
    assert.doesNotMatch(html, /demo-page/);
});

test('renderiza todo o histórico das PICS e a linha do tempo como a quarta página da Unidade 1', () => {
    const unit = unitsBySlug.get('unidade-1');
    const html = renderUnit({course, unit, page: 4});
    const timelines = html.match(/<pics-horizontal-timeline\b/g) || [];
    const events = html.match(/<li data-timeline-event\b/g) || [];
    const pageHtml = unit.pages[3].html;

    assert.equal(unit.pages.length, 8);
    assert.equal(unit.pages[3].title, 'Histórico das PICS no Sistema Único de Saúde (SUS)');
    assert.equal(timelines.length, 1);
    assert.equal(events.length, 9);
    assert.match(html, /data-unit="unidade-1" data-page="4"/);
    assert.match(html, /class="pagina-conteudo pagina-historico-pics"/);
    assert.match(html, /historico-pics-sus\.jpg/);
    assert.match(html, /Caro cursista, nesta unidade apresentaremos a história das Práticas Integrativas e Complementares em Saúde/);
    assert.match(html, /A adoção das Práticas Integrativas e Complementares em Saúde \(PICS\) no Brasil segue uma tendência mundial/);
    assert.match(html, /Como surgiram as PICS/);
    assert.match(html, /Atualmente, as PICS estão presentes em mais de 4\.300 municípios brasileiros \(78% do total\)/);
    assert.match(html, /A OMS \(2014–2023\) também reforça a importância da integração dessas práticas/);
    assert.match(html, /Período \/ Marco\. Evento \/ Política\. Principais Avanços\./);

    for (const eventTitle of [
        'Declaração de Alma-Ata (OMS)',
        'Início dos debates no Brasil',
        '8ª Conferência Nacional de Saúde (CNS)',
        'Resolução CIPLAN nº 5',
        'Pesquisas e grupos sobre “racionalidades médicas”',
        'Criação da PNPIC – Portaria nº 971/2006 (Ministério da Saúde)',
        'Portaria nº 849/2017',
        'Portaria nº 702/2018',
        'Expansão e consolidação',
    ]) assert.ok(html.includes(eventTitle), `evento ausente: ${eventTitle}`);

    assert.match(html, /Principais Características e Avanços das PICS/);
    assert.match(html, /Estimulam mecanismos naturais de prevenção de agravos/);
    assert.match(html, /Desafios persistentes: falta de financiamento estável/);
    assert.match(html, /incorporando incorporando tecnologias leves de saúde/);
    assert.match(html, /Perguntas para a sua Reflexão:/);
    assert.match(html, /Como a criação da Política Nacional de Práticas Integrativas e Complementares no SUS/);
    assert.match(html, /FURTADO, José Henrique de Lacerda; QUEIROZ, Caio Ramon/);
    assert.equal((pageHtml.match(/pagina-historico-pics__card-icone/g) || []).length, 2);
    assert.doesNotMatch(pageHtml, /\[(?:Começo|Fim|COMEÇO|FIM|Criar)/);
    assert.doesNotMatch(pageHtml, /Lorem ipsum|Event title here|16 Jan/);
    assert.match(html, /Página 4 de 8/);
    assert.match(html, /aria-valuenow="50"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/3"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/5"/);
    assert.match(html, /aria-label="Ir para a página 4: Histórico das PICS no Sistema Único de Saúde \(SUS\)" aria-current="page"/);
});

test('renderiza as três partes do PDF e o pillar stack como a quinta página da Unidade 1', () => {
    const unit = unitsBySlug.get('unidade-1');
    const html = renderUnit({course, unit, page: 5});
    const pageHtml = unit.pages[4].html;

    assert.equal(unit.pages.length, 8);
    assert.equal(unit.pages[4].title, 'Importância das PICS para ampliar o cuidado em saúde');
    assert.match(html, /data-unit="unidade-1" data-page="5"/);
    assert.match(html, /class="pagina-conteudo pagina-importancia-pics"/);
    assert.match(pageHtml, /<section class="conteudo-texto-corrido" aria-labelledby="unidade-1-pagina-5-titulo">/);
    assert.match(pageHtml, /<h2 id="unidade-1-pagina-5-titulo">Importância das PICS para ampliar o cuidado em saúde<\/h2>/);
    assert.match(pageHtml, /<h3>Ampliação do cuidado<\/h3>/);
    assert.equal((pageHtml.match(/<p(?:\s|>)/g) || []).length, 19);
    assert.match(pageHtml, /As Práticas Integrativas e Complementares em Saúde \(PICS\) têm se destacado por ampliarem a visão sobre o cuidado/);
    assert.match(pageHtml, /Agora que você conheceu a história das Práticas Integrativas e Complementares \(PICS\)/);
    assert.match(pageHtml, /Quando as PICS são incorporadas à APS, ocorre uma ampliação do conceito de cuidado/);
    assert.match(pageHtml, /As PICS são potentes ferramentas para transformar o cuidado em saúde/);
    assert.match(pageHtml, /Portanto, a integração das PICS aos serviços de saúde representa uma estratégia potente/);
    assert.match(pageHtml, /<h3 id="unidade-1-pagina-5-pontos-titulo">Principais pontos do texto:<\/h3>/);
    assert.match(pageHtml, /O texto argumenta que a integração das PICS na APS é uma estratégia crucial para aprimorar o modelo de cuidado em saúde no Brasil/);

    const stack = pageHtml.match(/<pics-pillar-stack\b[\s\S]*?<\/pics-pillar-stack>/)?.[0] || '';
    assert.match(stack, /role="list"/);
    assert.match(stack, /aria-labelledby="unidade-1-pagina-5-pontos-titulo"/);
    assert.equal((stack.match(/data-stack-card/g) || []).length, 5);
    assert.equal((stack.match(/role="listitem"/g) || []).length, 5);
    assert.equal((stack.match(/class="pillar-stack__icon"/g) || []).length, 5);
    assert.equal((stack.match(/class="pillar-stack__title"/g) || []).length, 5);
    assert.equal((stack.match(/<li>/g) || []).length, 4);
    assert.match(stack, /Ampliação do Olhar e Cuidado Integral:/);
    assert.match(stack, /Afinidade com a Humanização \(PNH\):/);
    assert.match(stack, /Caráter Contra-Hegemônico:/);
    assert.match(stack, /Aumento da Resolutividade e Sustentabilidade:/);
    assert.match(stack, /Reduzem o uso excessivo de medicamentos \(medicalização\)\./);
    assert.match(stack, /Melhoram a qualidade de vida e aliviam o sofrimento/);
    assert.match(stack, /Estimulam o autocuidado e o autoconhecimento\./);
    assert.match(stack, /Apresentam uma boa relação custo\/benefício\./);
    assert.match(stack, /Potencial de Transformação:/);
    assert.match(stack, /a adoção das PICS não deve ser acessória, mas sim uma prática com potencial transformador/);

    assert.match(pageHtml, /<section class="pagina-historico-pics__card pagina-historico-pics__card--reflexao" aria-labelledby="unidade-1-pagina-5-reflexao-titulo">/);
    assert.match(pageHtml, /<h2 id="unidade-1-pagina-5-reflexao-titulo">Questões para Discussão e Reflexão<\/h2>/);
    const questions = pageHtml.match(/<ol class="pagina-historico-pics__perguntas">[\s\S]*?<\/ol>/)?.[0] || '';
    assert.equal((questions.match(/<li>/g) || []).length, 3);
    assert.match(questions, /Que estratégias de educação permanente e divulgação são necessárias/);
    assert.match(questions, /De que forma a falta de recursos básicos afeta a continuidade e a qualidade/);
    assert.match(questions, /Como a APS pode usar as PICS de forma mais estratégica/);

    const references = pageHtml.match(/<section class="pagina-historico-pics__referencias" aria-labelledby="unidade-1-pagina-5-referencias-titulo">[\s\S]*?<\/section>/)?.[0] || '';
    assert.match(references, /<h2 id="unidade-1-pagina-5-referencias-titulo">Referências:<\/h2>/);
    assert.equal((references.match(/<p>/g) || []).length, 2);
    assert.match(references, /QUEIROZ, Neila Alves de; BARBOSA, Fernanda Elizabeth Sena; DUARTE, Wellington Bruno Araujo/);
    assert.match(references, /SCHVEITZER, Mariana Cabral; ESPER, Marcos Venicio; SILVA, Maria Júlia Paes da/);
    assert.match(html, /Página 5 de 8/);
    assert.match(html, /aria-valuenow="63"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/4"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/6"/);
    assert.match(html, /aria-label="Ir para a página 5: Importância das PICS para ampliar o cuidado em saúde" aria-current="page"/);
});

test('renderiza o conteúdo integral e estruturado do PDF como a sexta página da Unidade 1', () => {
    const unit = unitsBySlug.get('unidade-1');
    const html = renderUnit({course, unit, page: 6});
    const pageHtml = unit.pages[5].html;

    assert.equal(unit.pages.length, 8);
    assert.equal(unit.pages[5].title, 'Políticas Públicas e Direitos da População nas Práticas Integrativas e Complementares do SUS');
    assert.match(html, /data-unit="unidade-1" data-page="6"/);
    assert.match(html, /class="pagina-conteudo pagina-politicas-pics"/);
    assert.match(pageHtml, /<h2 id="unidade-1-pagina-6-titulo">Políticas Públicas e Direitos da População nas Práticas Integrativas e Complementares do SUS<\/h2>/);
    assert.match(pageHtml, /As Práticas Integrativas e Complementares em Saúde \(PICS\) fazem parte de uma política pública nacional/);
    assert.equal((pageHtml.match(/class="lista-ordenada-estilizada-1-wrapper/g) || []).length, 3);

    const guidelines = pageHtml.match(/<section class="[^"]*pagina-politicas-pics__diretrizes[^"]*"[\s\S]*?<\/section>/)?.[0] || '';
    assert.match(guidelines, /Principais diretrizes da Portaria PNPIC/);
    assert.equal((guidelines.match(/<li>/g) || []).length, 12);
    for (const guideline of [
        'Segurança',
        'Eficácia',
        'Acesso',
        'Qualificação profissional',
        'Integralidade do cuidado',
        'Desenvolvimento multiprofissional',
        'Implementação e fortalecimento',
        'Informação e divulgação',
        'Ações intersetoriais',
        'Participação social',
        'Acesso a insumos',
        'Acompanhamento e avaliação',
    ]) assert.ok(guidelines.includes(`<strong>${guideline}</strong>`), `diretriz ausente: ${guideline}`);
    assert.match(guidelines, /Portaria nº 971, publicada pelo Ministério da Saúde em 2006/);
    assert.match(guidelines, /Desenvolver ações de acompanhamento e avaliação das PICs para instrumentalizar a gestão/);

    assert.match(pageHtml, /Relação com outras políticas de saúde/);
    const policies = pageHtml.match(/aria-labelledby="unidade-1-pagina-6-politicas-lista-titulo"[\s\S]*?<\/section>/)?.[0] || '';
    assert.equal((policies.match(/<li>/g) || []).length, 5);
    assert.match(policies, /Política Nacional de Atenção Básica/);
    assert.match(policies, /Equidade e populações tradicionais/);

    assert.match(pageHtml, /Direitos da População em Relação às PICS/);
    const rights = pageHtml.match(/aria-labelledby="unidade-1-pagina-6-direitos-lista-titulo"[\s\S]*?<\/section>/)?.[0] || '';
    assert.equal((rights.match(/<li>/g) || []).length, 4);
    assert.match(rights, /Direito ao acesso/);
    assert.match(rights, /Direito à informação/);
    assert.match(rights, /Direito à integralidade e pluralidade terapêutica/);
    assert.match(rights, /Direito à segurança e qualidade/);
    assert.equal((rights.match(/pagina-politicas-pics__subitem/g) || []).length, 4);
    assert.match(pageHtml, /O trabalho das equipes de saúde da família é essencial para a efetividade das PICS/);

    assert.match(pageHtml, /<section class="pagina-historico-pics__card pagina-historico-pics__card--resumo" aria-labelledby="unidade-1-pagina-6-conclusao-titulo">/);
    assert.match(pageHtml, /Nesta sessão tivemos a oportunidade de conhecer as principais diretrizes da PNPIC/);
    assert.match(pageHtml, /Sendo assim, as PICS representam um importante instrumento de cuidado integral/);
    assert.equal((pageHtml.match(/pagina-historico-pics__card-icone/g) || []).length, 2);

    const questions = pageHtml.match(/<ol class="pagina-historico-pics__perguntas">[\s\S]*?<\/ol>/)?.[0] || '';
    assert.equal((questions.match(/<li>/g) || []).length, 5);
    assert.match(questions, /O que significa cuidar da pessoa de forma integral nas PICS/);
    assert.match(questions, /Como as PICS podem ajudar no cuidado diário das pessoas atendidas na UBS/);

    const references = pageHtml.match(/<section class="pagina-historico-pics__referencias" aria-labelledby="unidade-1-pagina-6-referencias-titulo">[\s\S]*?<\/section>/)?.[0] || '';
    assert.equal((references.match(/<p>/g) || []).length, 5);
    assert.match(references, /BARROS, Nelson Filice de; SPADACIO, Cristiane; COSTA, Marcelo Viana da/);
    assert.match(references, /WHO Traditional Medicine Strategy 2025–2034/);
    assert.doesNotMatch(pageHtml, /<pics-[a-z-]+/);

    assert.match(html, /Página 6 de 8/);
    assert.match(html, /aria-valuenow="75"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/5"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/7"/);
    assert.match(html, /aria-label="Ir para a página 6: Políticas Públicas e Direitos da População nas Práticas Integrativas e Complementares do SUS" aria-current="page"/);
});

test('repete o conteúdo da segunda página com título próprio na sétima página da Unidade 1', () => {
    const unit = unitsBySlug.get('unidade-1');
    const html = renderUnit({course, unit, page: 7});
    const pageTwo = unit.pages[1];
    const pageSeven = unit.pages[6];

    assert.equal(unit.pages.length, 8);
    const pageSevenTitle = 'Papel dos ACS e ACE na promoção e fortalecimento das PICS';

    assert.equal(pageSeven.title, pageSevenTitle);
    assert.equal(pageSeven.className, pageTwo.className);
    assert.equal(
        pageSeven.html,
        pageTwo.html
            .replaceAll('unidade-1-pagina-2-titulo', 'unidade-1-pagina-7-titulo')
            .replaceAll(pageTwo.title, pageSevenTitle),
    );
    assert.match(html, /data-unit="unidade-1" data-page="7"/);
    assert.match(html, /class="pagina-conteudo pagina-flipbook-interativo"/);
    assert.match(html, /<h2 id="unidade-1-pagina-7-titulo" class="flipbook-introducao-titulo">Papel dos ACS e ACE na promoção e fortalecimento das PICS<\/h2>/);
    assert.match(html, /src="\.\/assets\/flipbook\/pdf\/HQ_page-0001\.pdf"/);
    assert.match(html, /<strong>Para refletir:<\/strong> durante a leitura/);
    assert.equal((html.match(/<pics-flipbook\b/g) || []).length, 1);
    assert.match(html, /Página 7 de 8/);
    assert.match(html, /aria-valuenow="88"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/6"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/8"/);
    assert.match(html, /aria-label="Ir para a página 7: Papel dos ACS e ACE na promoção e fortalecimento das PICS" aria-current="page"/);
});

test('renderiza leitura complementar, fórum e avaliação como a oitava página da Unidade 1', () => {
    const unit = unitsBySlug.get('unidade-1');
    const html = renderUnit({course, unit, page: 8});
    const pageHtml = unit.pages[7].html;

    assert.equal(unit.pages.length, 8);
    assert.equal(unit.pages[7].title, 'Leitura Complementar, Dialogando com a Prática e Avaliação');
    assert.equal(unit.pages[7].className, 'pagina-recursos-unidade-1');
    assert.match(html, /data-unit="unidade-1" data-page="8"/);
    assert.match(html, /class="pagina-conteudo pagina-recursos-unidade-1"/);

    assert.match(pageHtml, /<section class="recurso-destaque recurso-destaque--leitura"/);
    assert.match(pageHtml, /<h2 id="unidade-1-pagina-8-leitura-titulo">Leitura Complementar<\/h2>/);
    assert.match(pageHtml, /linha do tempo da Coordenação Nacional de Práticas Integrativas e Complementares em Saúde \(CNPICS\)/);
    assert.match(pageHtml, /href="\.\/assets\/documents\/unidade-1\/linha-do-tempo-cnpics\.pdf" target="_blank" rel="noopener noreferrer"/);
    assert.ok(existsSync(new URL('../assets/documents/unidade-1/linha-do-tempo-cnpics.pdf', import.meta.url)));

    assert.match(pageHtml, /<section class="forum-pratica pagina-recursos-unidade-1__forum"/);
    assert.match(pageHtml, /Dialogando com a Prática/);
    assert.match(pageHtml, /src="\.\/assets\/images\/forum-dialogando-com-a-pratica\.webp"/);
    assert.match(pageHtml, /class="forum-pratica-botao" href="#" data-config-link="forumUrl"/);

    assert.match(pageHtml, /<section class="formulario-atividade pagina-recursos-unidade-1__avaliacao"/);
    assert.match(pageHtml, /<h2 id="unidade-1-pagina-8-avaliacao-titulo" class="formulario-atividade-titulo">Avaliação<\/h2>/);
    assert.match(pageHtml, /Avaliação da Unidade 1 \(05 questões de múltipla escolha\)\./);
    assert.match(pageHtml, /class="formulario-atividade-botao" href="#" data-config-link="unitOneAssessmentUrl"/);
    assert.equal((pageHtml.match(/class="recurso-destaque-icone"/g) || []).length, 2);

    assert.match(html, /Página 8 de 8/);
    assert.match(html, /aria-valuenow="100"/);
    assert.match(html, /href="#\/unidade\/unidade-1\/pagina\/7"/);
    assert.doesNotMatch(html, /class="navegacao-pagina-link proximo"/);
    assert.match(html, /aria-label="Ir para a página 8: Leitura Complementar, Dialogando com a Prática e Avaliação" aria-current="page"/);
});
