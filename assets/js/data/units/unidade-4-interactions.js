// ==========================================================================
// Aula 4 - PICS no Território
// Dados usados pelos componentes interativos (script.js)
// ==========================================================================

export const groupPurposes = [
  { id:'g1', title:'Pedagógica ou educativa', objective:'Informar, orientar e promover autonomia no cuidado.', picsRelation:'Educação em saúde com práticas integrativas (autocuidado, respiração, alimentação saudável, uso seguro de plantas medicinais).', examples:'Rodas de conversa; grupos de hipertensos e diabéticos; orientação durante visitas domiciliares; apoio na organização de grupos educativos.' },
  { id:'g2', title:'Terapêutica', objective:'Apoiar o cuidado e o tratamento em grupo.', picsRelation:'Uso de PICS como auriculoterapia, plantas medicinais e fitoterapia, práticas corporais e relaxamento.', examples:'Grupos de dor crônica, tabagismo, cuidado com feridas; apoio na adesão ao cuidado e acompanhamento comunitário.' },
  { id:'g3', title:'Psicoterápica', objective:'Trabalhar aspectos emocionais e subjetivos.', picsRelation:'Meditação e práticas integrativas para saúde mental (relaxamento, atenção plena).', examples:'Encaminhamento e apoio a grupos conduzidos por profissionais habilitados; identificação de sofrimento psíquico no território.' },
  { id:'g4', title:'Apoio / suporte', objective:'Oferecer acolhimento, escuta e fortalecimento de vínculos.', picsRelation:'Práticas integrativas como rodas de conversa/escuta, práticas de cuidado emocional e comunitário.', examples:'Grupos de gestantes, mulheres, pessoas com sofrimento ou uso de substâncias; ACS e ACE fortalecem a rede de apoio.' },
  { id:'g5', title:'Convivência', objective:'Promover socialização, pertencimento e qualidade de vida.', picsRelation:'Práticas corporais integrativas, danças circulares, atividades de relaxamento coletivo.', examples:'Grupos de idosos, encontros comunitários; estímulo à participação social e ao convívio saudável.' },
  { id:'g6', title:'Atividades físicas', objective:'Promover saúde, prevenir doenças e melhorar qualidade de vida.', picsRelation:'Yoga, Lian Gong, Tai Chi Chuan, alongamentos e caminhadas orientadas.', examples:'Grupos de caminhada, práticas corporais em praças e UBS; incentivo à adesão e continuidade.' },
  { id:'g7', title:'Aprimoramento do processo de trabalho', objective:'Ampliar o acesso e organizar a demanda.', picsRelation:'PICS como estratégia coletiva de cuidado e promoção da saúde.', examples:'Atividades em grupo para reduzir filas; organização de ações coletivas sem perder o olhar humanizado.' }
];

export const mapNodes = [
  { id:'potencial', label:'Potencial das PICS', detail:'As Práticas Integrativas e Complementares em Saúde apresentam elevado potencial para ampliar o cuidado integral, fortalecer a Atenção Primária à Saúde e reduzir a medicalização.' },
  { id:'acsace', label:'Contribuição para ACS e ACE', detail:'As PICS ampliam as possibilidades de atuação dos agentes no território, fortalecendo ações de promoção da saúde, prevenção de doenças, educação em saúde e vínculo com a comunidade.' },
  { id:'humanizacao', label:'Humanização do cuidado', detail:'Favorecem atributos centrais da Política Nacional de Humanização, como acolhimento, vínculo, autonomia, protagonismo e cuidado integral, indo além do modelo biomédico.' },
  { id:'sujeito', label:'Valorização do sujeito', detail:'Contribuem para a valorização das pessoas em sua dimensão biopsicossocial, reconhecendo saberes populares e fortalecendo o autocuidado.' },
  { id:'comunidade', label:'Relação com a comunidade', detail:'Promovem relações mais próximas, horizontais e humanizadas entre ACS, ACE, equipes de saúde e usuários, fortalecendo os vínculos comunitários.' },
  { id:'sus', label:'Fortalecimento do SUS', detail:'As PICS reforçam os princípios do SUS, especialmente a integralidade e a humanização do cuidado, contribuindo para uma APS mais resolutiva e sensível às necessidades do território.' }
];

export const practiceScripts = [
  { id:'roda', label:'Roda de Conversa PICS (ACS)', meta:'Duração total: aproximadamente 60 min', steps: [
    { title:'Abertura e apresentação (20 min) -', text:'"As práticas de autocuidado PICS como uma teia de cuidados": dois ACS seguram um novelo de lã; cada participante diz seu nome e uma prática de autocuidado que conhece, formando uma teia ao final.' },
    { title:'Aquietamento: meditação de presença e respiração (10 min) -', text:'Convite a fechar os olhos ou baixar o olhar, sentir os pés no chão e fazer ao menos três respirações lentas e profundas.' },
    { title:'Aquecimento e descontração: Biodança (20 min) -', text:'Música rítmica e alegre para induzir movimentos expressivos livres, evoluindo para caminhada rítmica com "encontros" entre participantes.' },
    { title:'Integração: Dança Circular (20 min) -', text:'Passos simples com música conhecida; mãos dadas representam apoio mútuo e igualdade entre os participantes.' },
    { title:'Relaxamento: escalda-pés e automassagem (40 min) -', text:'Pés em bacia com água morna, sal grosso e ervas; automassagem em mãos e pescoço com óleo ou creme.' },
    { title:'Fechamento e partilha (20 min) -', text:'Roda de conversa final: "Quem gostaria de falar uma palavra sobre o que sentiu hoje?"' }
  ]},
  { id:'cultivo', label:'Cultivo Medicinal Seguro e Saudável (ACE)', meta:'Duração total: aproximadamente 1h30', steps: [
    { title:'Acolhimento: "Minha Planta, Meu Cuidado" (20 min) -', text:'Cada participante se apresenta dizendo com qual planta medicinal se identifica hoje e por quê.' },
    { title:'Roda de conversa: "Onde a Planta Mora?" (20 min) -', text:'Luminosidade, circulação de ar, organização dos vasos e locais seguros de coleta e cultivo.' },
    { title:'Oficina prática: o fim do pratinho com água (20 min) -', text:'Uso de areia grossa no pratinho ou vasos com drenagem direta, para eliminar criadouros do mosquito.' },
    { title:'Higienização: da colheita ao consumo (20 min) -', text:'Lavagem em água corrente e sanitização com hipoclorito de sódio (1 colher de sopa para 1 litro de água) por 15 minutos, com enxágue final.' },
    { title:'Fechamento: "Troca de Saberes" (10 min) -', text:'Troca de mudas entre participantes e entrega de checklist "Cultivo Seguro: Sol, Areia no Pratinho e Higienização".' }
  ]},
  { id:'integrado', label:'Arboviroses - Roteiro Integrado ACS e ACE', meta:'Duração total: aproximadamente 2 horas · dupla ACS + ACE', steps: [
    { title:'Abertura: "O Ciclo da Vida" (20 min) -', text:'Cada participante escolhe uma folha aromática e se apresenta associando-a a uma sensação de saúde; o ACE reforça a ligação entre plantas e ambiente livre de focos do mosquito.' },
    { title:'Painel integrado: o ambiente que cura vs. o ambiente que adoece (20 min) -', text:'Demonstração de cultivo seguro - areia nos pratinhos, cuidado com bromélias e plantas que acumulam água.' },
    { title:'PICS no manejo da dor e recuperação (30 min) -', text:'Automassagem com óleo em articulações doloridas, cataplasma de argila fria e, se houver capacitação, auriculoterapia para ansiedade e dor.' },
    { title:'Arteterapia: "Meu Corpo Pós-Arbovirose" (15 min) -', text:'Desenho de onde a dor "morava" e de como o participante se sente após a dinâmica.' },
    { title:'Vivência sensorial: escalda-pés terapêutico (30 min) -', text:'Meditação guiada de "limpeza do corpo" durante o escalda-pés, seguida da entrega do "Checklist do Quintal Saudável" pelo ACE.' },
    { title:'Encerramento: chá comunitário (5 min) -', text:'Chá de capim-limão ou erva-doce, reforçando a importância da hidratação em casos de arboviroses.' }
  ]}
];

export const matchingTerms = [
  { id:'t1', label:'Pedagógica', targetId:'p1' },
  { id:'t2', label:'Terapêutica', targetId:'p2' },
  { id:'t3', label:'Psicoterápica', targetId:'p3' },
  { id:'t4', label:'Convivência', targetId:'p4' }
];
export const matchingTargets = [
  { id:'p1', description:'Informar, orientar e promover autonomia no cuidado, por meio da educação em saúde.' },
  { id:'p2', description:'Apoiar o cuidado e o tratamento em grupo, com PICS como auriculoterapia, fitoterapia e práticas corporais.' },
  { id:'p3', description:'Trabalhar aspectos emocionais e subjetivos, com meditação e práticas voltadas à saúde mental.' },
  { id:'p4', description:'Promover socialização, pertencimento e qualidade de vida, com práticas corporais e danças circulares.' }
];

export const unitFourQuestions = [
    {
        "label": "Questão 1.",
        "prompt": "Sobre o uso das PICS na Atenção Básica/Atenção Primária à Saúde, assinale a alternativa correta:",
        "options": [
            "a) As atividades coletivas com PICS na Atenção Primária têm como foco exclusivo o tratamento de doenças, não sendo indicadas para ações de promoção da saúde ou fortalecimento de vínculos comunitários.",
            "b) As PICS são utilizadas principalmente em atendimentos individuais, sendo pouco adequadas para grupos, rodas de conversa, oficinas ou mutirões na Atenção Primária à Saúde.",
            "c) Os grupos, oficinas, rodas de conversa e mutirões que utilizam PICS contribuem para a promoção da saúde, prevenção de doenças, cuidado integral, fortalecimento de vínculos, valorização dos saberes populares e ampliação da participação social no território.",
            "d) A atuação dos ACS e ACE nas ações com PICS limita-se à execução de tarefas administrativas, sem participação na mobilização comunitária ou no apoio às práticas coletivas.",
            "e) Os mutirões de saúde que incluem PICS restringem-se à oferta de práticas integrativas isoladas, não podendo ser articulados a outras ações como vacinação, exames, orientações ou atendimentos clínicos."
        ],
        "correctIndex": 2,
        "feedback": "Você acertou! As PICS, quando utilizadas em atividades coletivas como grupos, oficinas, rodas de conversa e mutirões, fortalecem o cuidado integral, a promoção da saúde, a prevenção de doenças, o vínculo entre equipes e comunidade, a participação social e a valorização dos saberes populares no território da APS.",
        "objective": "Reconhecer as PICS como estratégia de prevenção e promoção da saúde em atividades coletivas."
    },
    {
        "label": "Questão 2.",
        "prompt": "Sobre o uso das PICS como ferramentas de aproximação, vínculo e educação em saúde no território da APS, assinale a alternativa correta:",
        "options": [
            "a) As PICS devem ser utilizadas prioritariamente em atendimentos individuais, apresentando pouca relevância para ações grupais, educativas ou comunitárias na Atenção Primária à Saúde.",
            "b) O uso das PICS no território tem como principal finalidade substituir as práticas biomédicas e dispensar a atuação de profissionais e agentes de saúde na APS.",
            "c) As PICS não possuem relação direta com os princípios do SUS e da Política Nacional de Humanização, sendo utilizadas apenas como práticas complementares sem impacto no cuidado integral.",
            "d) A atuação dos ACS e ACE nas PICS restringe-se à observação das atividades, não contribuindo para ações educativas, preventivas ou de promoção da saúde no território.",
            "e) As PICS contribuem para fortalecer o cuidado integral, ampliar o autocuidado, reduzir a medicalização e promover relações mais horizontais e humanizadas entre ACS, ACE, equipes de saúde e comunidade."
        ],
        "correctIndex": 4,
        "feedback": "Você acertou! As PICS fortalecem o cuidado integral, estimulam o autocuidado e a autonomia, reduzem a medicalização, promovem vínculos comunitários e favorecem relações mais horizontais e humanizadas, além de ampliarem as possibilidades de atuação de ACS e ACE no território.",
        "objective": "Reconhecer as PICS como ferramenta de aproximação, vínculo e educação em saúde."
    },
    {
        "label": "Questão 3.",
        "prompt": "A respeito das PICS, das Práticas Populares de Saúde e do conceito de território na Atenção Primária à Saúde, assinale a alternativa correta:",
        "options": [
            "a) As Práticas Integrativas e Complementares em Saúde não fazem parte das ações do SUS, sendo utilizadas apenas de forma isolada e desvinculadas de políticas públicas nacionais.",
            "b) O território, segundo a abordagem de Milton Santos, limita-se a um espaço geográfico físico, sem considerar relações sociais, culturais, econômicas ou de poder.",
            "c) As PICS e as práticas populares de saúde fortalecem o cuidado integral no SUS, valorizam o autocuidado, os saberes tradicionais e a diversidade cultural, devendo ser articuladas aos serviços de saúde, especialmente na Atenção Básica.",
            "d) As práticas populares de saúde, como benzimento e uso de ervas medicinais, são pouco conhecidas pela população e não exercem influência significativa nas estratégias de cuidado adotadas pelas comunidades.",
            "e) A Política Nacional de Educação Popular em Saúde (PNEPS-SUS) tem como foco exclusivo a formação acadêmica dos profissionais de saúde, não contemplando práticas populares, participação social ou controle social no SUS."
        ],
        "correctIndex": 2,
        "feedback": "Você acertou! As PICS fazem parte do SUS e da PNPIC, dialogam com as Práticas Populares de Saúde presentes nos territórios e devem ser articuladas a elas, valorizando o autocuidado, os saberes tradicionais, a diversidade cultural e o território, especialmente na Atenção Primária à Saúde.",
        "objective": "Compreender o conceito de território e reconhecer as Práticas Populares de Saúde."
    },
    {
        "label": "Questão 4.",
        "prompt": "Considerando o campo de atuação no território e o uso das PICS como estratégia de cuidado integral na Atenção Primária à Saúde, assinale a alternativa correta:",
        "options": [
            "a) As PICS no território têm atuação restrita ao ambiente das Unidades Básicas de Saúde, não sendo recomendadas em espaços comunitários como praças, escolas ou hortas comunitárias.",
            "b) As PICS, quando desenvolvidas no território por meio de ações como hortas comunitárias, rodas de meditação e práticas corporais, contribuem para a promoção da qualidade de vida, prevenção de doenças e fortalecimento dos vínculos sociais na comunidade.",
            "c) As ações territoriais com PICS priorizam exclusivamente o tratamento de doenças, não tendo relação com a promoção da saúde, a prevenção de agravos ou o fortalecimento da participação comunitária.",
            "d) O desenvolvimento de PICS no território não influencia o vínculo entre equipes de saúde e comunidade, pois essas práticas têm caráter apenas individual e terapêutico.",
            "e) As hortas comunitárias e rodas de meditação, enquanto exemplos de PICS no território, substituem as demais ações de saúde da Atenção Primária, tornando desnecessária a articulação com outros serviços e políticas públicas."
        ],
        "correctIndex": 1,
        "feedback": "Você acertou! As PICS, quando desenvolvidas no território por meio de exemplos práticos como hortas comunitárias, práticas corporais da medicina chinesa, rodas de meditação e outras ações coletivas, promovem cuidado integral, melhoram a qualidade de vida, contribuem para a prevenção de doenças e fortalecem os vínculos sociais e comunitários.",
        "objective": "Reconhecer exemplos práticos de PICS no território (vídeo VA4)."
    },
    {
        "label": "Questão 5.",
        "prompt": "Sobre o desenvolvimento das PICS no território da Atenção Primária à Saúde e suas contribuições para o cuidado integral, assinale a alternativa correta:",
        "options": [
            "a) A implementação das PICS no território favorece o cuidado integral ao considerar as dimensões físicas, emocionais, sociais e culturais das pessoas, além de estimular o autocuidado e a participação comunitária.",
            "b) As ações com PICS no território têm como foco principal a realização de procedimentos técnicos, não sendo indicadas para ações educativas, comunitárias ou de fortalecimento dos vínculos sociais.",
            "c) As PICS devem ser desenvolvidas apenas por profissionais especialistas, não sendo recomendada a participação de ACS e ACE nas ações territoriais e comunitárias.",
            "d) As ações territoriais com PICS não contribuem para a prevenção de doenças, estando restritas ao alívio de sintomas já instalados.",
            "e) O uso das PICS no território impede a articulação com outras políticas públicas e ações da Atenção Primária, por se tratar de práticas isoladas e independentes."
        ],
        "correctIndex": 0,
        "feedback": "Você acertou! As PICS no território ampliam o cuidado integral ao considerar múltiplas dimensões do sujeito, promover o autocuidado, fortalecer a participação comunitária e articular ações de promoção da saúde, prevenção de doenças e fortalecimento dos vínculos sociais.",
        "objective": "Sintetizar as contribuições das PICS no território."
    }
];

export const unitFourMessages = {
    "objectiveLabel": "Objetivo principal:",
    "relationLabel": "Relação com as PICS:",
    "examplesLabel": "Exemplos de ações / papel de ACS e ACE:",
    "matchingPlaceholder": "(arraste aqui)",
    "matchingProgressSuffix": "corretos",
    "matchingSuccess": "Muito bem! Você acertou todos os pares.",
    "matchingRetry": "Revise os pares incorretos e tente novamente.",
    "feedbackLabel": "Feedback (correta):",
    "relatedObjectiveLabel": "Objetivo relacionado:"
};
