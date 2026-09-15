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


export const unitFourMessages = {
    "objectiveLabel": "Objetivo principal:",
    "relationLabel": "Relação com as PICS:",
    "examplesLabel": "Exemplos de ações / papel de ACS e ACE:",
    "matchingPlaceholder": "(arraste aqui)",
    "matchingProgressSuffix": "corretos",
    "matchingSuccess": "Muito bem! Você acertou todos os pares.",
    "matchingRetry": "Revise os pares incorretos e tente novamente."
};
