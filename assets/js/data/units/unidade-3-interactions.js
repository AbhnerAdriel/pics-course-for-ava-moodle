// ==========================================================================
// Aula 3 - Yoga e Meditação
// Dados usados pelos componentes interativos (script.js)
// ==========================================================================

export const ASHTANGA_PILLARS = [
  { id:'p1', title:'Yamas (Conduta Ética Externa)', text:'Restrições éticas ou princípios morais que guiam o praticante nas suas intenções com os outros e o mundo: não-violência (Ahimsa), verdade (Satya), não roubar (Asteya), moderação (Brahmacharya) e não possessividade (Aparigraha).' },
  { id:'p2', title:'Niyamas (Conduta Ética Interna)', text:'Observâncias pessoais que ajudam a cultivar um estilo de vida saudável e introspectivo: pureza (Saucha), contentamento (Santosha), austeridade (Tapas), autoestudo (Svadhyaya) e entrega a um poder maior (Ishvarapranidhana).' },
  { id:'p3', title:'Āsanas (Postura física)', text:'Posturas físicas que purificam e fortalecem o corpo e preparam a mente para a meditação.' },
  { id:'p4', title:'Prāṇāyāma (Controle da Respiração)', text:'Regula o fluxo de energia vital (prana) e acalma a mente.' },
  { id:'p5', title:'Pratyāhāra (Retração dos Sentidos)', text:'Desconexão dos sentidos das distrações externas, voltando a atenção para dentro de si.' },
  { id:'p6', title:'Dhāraṇā (Concentração)', text:'Foco da mente em um único ponto ou objeto, um passo inicial para a meditação.' },
  { id:'p7', title:'Dhyāna (Meditação)', text:'Alcançando um estado de consciência expandida e tranquila.' },
  { id:'p8', title:'Samādhi (Absorção/Iluminação)', text:'Estado de absorção total na consciência pura e transcendência do eu individual - objetivo final do caminho.' }
];

export const BENEFIT_ACCORDION = [
  { id:'d1', title:'Saúde mental', text:'Redução do estresse, ansiedade e sintomas depressivos; melhora da qualidade do sono; aumento da concentração, memória e autocontrole emocional; fortalecimento do vínculo mente-corpo e do autoconhecimento.' },
  { id:'d2', title:'Saúde física', text:'Melhora da flexibilidade, força muscular e postura; auxílio no controle da dor crônica (lombalgia, fibromialgia, cefaleia); contribuição para o controle da pressão arterial e da glicemia; estímulo à respiração consciente.' },
  { id:'d3', title:'Promoção da saúde e prevenção', text:'Incentivo a hábitos de vida mais saudáveis; redução do uso excessivo de medicamentos, especialmente ansiolíticos e analgésicos; prevenção de doenças crônicas não transmissíveis.' },
  { id:'d4', title:'Aspectos sociais e comunitários', text:'Práticas de baixo custo e fácil implementação; fortalecimento do cuidado integral e humanizado; promoção do acolhimento, da escuta qualificada e do vínculo; estímulo à participação comunitária.' },
  { id:'d5', title:'Políticas públicas de saúde', text:'Integração com a Política Nacional de Práticas Integrativas e Complementares no SUS (PNPIC); contribuição para os princípios do SUS: integralidade, equidade e promoção da saúde.' }
];

export const MAP_NODES = [
  { id:'yoga', label:'Yoga', detail:'Prática corporal e mental de origem oriental utilizada como técnica para controlar corpo e mente, associada à meditação (Brasil, 2018). Estrutura-se nos 8 passos do Ashtanga Yoga.' },
  { id:'meditacao', label:'Meditação', detail:'Treinamento sistemático da atenção, que promove alterações favoráveis no humor e no desempenho cognitivo. Corresponde aos últimos passos do Ashtanga Yoga (Dharana, Dhyana e Samadhi).' },
  { id:'ashtanga', label:'8 passos (Ashtanga)', detail:'Caminho composto por Yamas, Niyamas, Āsanas, Pranayama, Pratyahara, Dharana, Dhyana e Samadhi, que conecta o Yoga à Meditação em uma mesma filosofia.' },
  { id:'beneficios', label:'Benefícios', detail:'Impactos comprovados nas dimensões da saúde mental, física, promoção e prevenção em saúde, aspectos sociais/comunitários e políticas públicas (PNPIC).' },
  { id:'ubs', label:'Aplicação na UBS', detail:'Yoga e Meditação podem ser oferecidos na Unidade Básica de Saúde, desde que conduzidos por profissional habilitado, gerando os benefícios estudados para a comunidade.' }
];

export const MEDITATION_STEPS = [
  { id:'s1', shortLabel:'Local tranquilo', label:'1. Escolha um lugar tranquilo', detail:'Os agentes de saúde podem auxiliar na organização da escolha do local, de preferência calmo e bem arejado, e no convite aos usuários que podem se beneficiar desta prática. Pode-se utilizar tapetes de yoga, kangas, colchonetes ou cadeiras. Uma música ambiente com alta frequência pode auxiliar na concentração e no relaxamento. Esta prática pode e deve ser feita em grupo.' },
  { id:'s2', shortLabel:'Postura adequada', label:'2. Adote uma postura adequada', detail:'Oriente a pessoa a sentar-se no chão em Shukasana, com as costas eretas e o corpo relaxado. Caso não seja confortável, sugira esticar as pernas com as costas apoiadas na parede, ou deitar em Shavasana. O importante é que a posição permita à pessoa ficar acordada e atenta.', resourceImage: 'assets/images/sukhasana.png', resourceCaption:'Figura 1 - Sukhasana (Postura Fácil). Fonte: SARASWATI, Swami Satyananda. Asana Pranayama Mudra Bandha. Munger, Bihar, Índia: Yoga Publications Trust, 2009.' },
  { id:'s3', shortLabel:'Fechar os olhos', label:'3. Feche os olhos, se se sentir à vontade', detail:'Explique que fechar os olhos ajuda na concentração, mas não é obrigatório.' },
  { id:'s4', shortLabel:'Atenção à respiração', label:'4. Preste atenção na respiração', detail:'Oriente a observar o ar entrando e saindo pelo nariz, ou o movimento da barriga ao respirar. É importante que o tempo de expiração seja o dobro da inspiração.', resourceText:'[ESPAÇO RESERVADO PARA INSERÇÃO DE RECURSO: áudio narrado com meditação guiada, sincronizado com as etapas 4 a 7, para o estudante acompanhar em tempo real.]' },
  { id:'s5', shortLabel:'Não controlar', label:'5. Não controle a respiração', detail:'Reforce que a respiração deve acontecer naturalmente, sem forçar ou mudar o ritmo.' },
  { id:'s6', shortLabel:'Distrações', label:'6. Lide com pensamentos e distrações', detail:'Explique que é normal a mente se distrair. Sempre que isso acontecer, a pessoa deve apenas voltar a atenção para a respiração, com calma. Pode também trazer a mente a meditar em algum yama (conduta ética externa).' },
  { id:'s7', shortLabel:'Palavras simples', label:'7. Use palavras simples para ajudar a concentração', detail:'Sugira repetir mentalmente palavras suaves, como "dentro" ao inspirar e "fora" ao expirar, ou "subindo" ao inspirar e "descendo" ao expirar.' },
  { id:'s8', shortLabel:'Finalização', label:'8. Observe o tempo da prática e finalize', detail:'Oriente a realizar a prática por alguns minutos, em torno de 5 a 10 minutos, respeitando os próprios limites. Ao terminar, a pessoa pode observar como o corpo e a mente estão se sentindo e, quando quiser, abrir os olhos.', resourceImage: 'assets/images/shavasana.png', resourceCaption:'Figura 2 - Shavasana (Postura do Cadáver). Fonte: SARASWATI, Swami Satyananda. Asana Pranayama Mudra Bandha. Munger, Bihar, Índia: Yoga Publications Trust, 2009.' }
];

export const DRAG_TERMS = [
  { id:'t1', label:'Yamas', targetId:'p1' },
  { id:'t2', label:'Niyamas', targetId:'p2' },
  { id:'t3', label:'Āsanas', targetId:'p3' },
  { id:'t4', label:'Prāṇāyāma', targetId:'p4' }
];
export const DRAG_TARGETS = [
  { id:'p1', description:'Restrições éticas ou princípios morais que guiam o praticante nas suas intenções com os outros e o mundo (conduta ética externa).' },
  { id:'p2', description:'Observâncias pessoais que ajudam a cultivar um estilo de vida saudável e introspectivo (conduta ética interna).' },
  { id:'p3', description:'Posturas físicas que purificam e fortalecem o corpo e preparam a mente para a meditação.' },
  { id:'p4', description:'Regula o fluxo de energia vital (prana) por meio do controle da respiração e acalma a mente.' }
];

export const matchingTerms = DRAG_TERMS;
export const matchingTargets = DRAG_TARGETS;
export const unitThreeMessages = {matchingPlaceholder:"(arraste aqui)",matchingProgressSuffix:"corretos",matchingSuccess:"Muito bem! Você acertou todos os pares.",matchingRetry:"Revise os pares incorretos e tente novamente."};
