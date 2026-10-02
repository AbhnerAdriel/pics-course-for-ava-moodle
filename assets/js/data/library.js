import {appConfig} from '../config.js';
import {course} from './course.js';

export const artifactTypes = Object.freeze([
    {id: 'pdf', label: 'PDF'},
    {id: 'video', label: 'Vídeo'},
    {id: 'link', label: 'Link externo'},
]);

export const libraryCategories = Object.freeze([
    {id: 'fundamentos', label: 'Fundamentos das PICS'},
    {id: 'politicas', label: 'Políticas e organização do SUS'},
    {id: 'plantas', label: 'Plantas medicinais e fitoterapia'},
    {id: 'praticas', label: 'Práticas integrativas'},
    {id: 'yoga', label: 'Yoga e meditação'},
    {id: 'territorio', label: 'Território e cuidado coletivo'},
    {id: 'saberes', label: 'Saberes populares e educação em saúde'},
    {id: 'aromaterapia', label: 'Aromaterapia'},
]);

// Cada entrada representa um recurso único, mesmo quando citado em várias aulas.
// URLs e arquivos são os utilizados nas unidades; os materiais pendentes usam a configuração comum.
const records = [
    {id: 'hq-pics', unit: 'unidade-1', page: 2, category: 'fundamentos', type: 'pdf', title: 'O que são Práticas Integrativas e Complementares em Saúde (PICS)', description: 'História em quadrinhos sobre as PICS e o papel dos agentes de saúde no cuidado integral.', url: './assets/flipbook/pdf/HQ_page-0001.pdf', image: './assets/flipbook/pdf/HQ_page-0001.flipbook/pages/page-001.webp'},
    {id: 'linha-do-tempo', unit: 'unidade-1', page: 8, category: 'politicas', type: 'pdf', title: 'Linha do tempo das PICS no Brasil', description: 'Material da CNPICS com os principais marcos da trajetória das práticas integrativas no SUS.', url: './assets/documents/unidade-1/linha-do-tempo-cnpics.pdf', image: './assets/images/unidades/unidade-01/historico-pics-sus.jpg'},
    {id: 'video-cuidados', unit: 'unidade-1', page: 3, category: 'fundamentos', type: 'video', title: 'Abordagens de cuidado integral — vídeo de exemplo', description: 'Vídeo de exemplo atualmente incorporado à aula sobre cuidado integral e aspectos biopsicossociais.', url: 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?rel=0'},

    {id: 'pnpic', unit: 'unidade-2', page: 8, category: 'politicas', type: 'pdf', title: 'Política Nacional de Práticas Integrativas e Complementares (PNPIC)', description: 'Documento do Ministério da Saúde com as diretrizes da PNPIC no SUS. Segunda edição, 2015.', file: 'pnpic-2ed-2015.pdf'},
    {id: 'pnpmf', unit: 'unidade-2', page: 8, category: 'plantas', type: 'pdf', title: 'Política Nacional de Plantas Medicinais e Fitoterápicos', description: 'Documento que institui a política nacional para plantas medicinais e fitoterápicos, de 2006.', file: 'pnpmf-2006.pdf'},
    {id: 'programa-plantas', unit: 'unidade-2', page: 8, category: 'plantas', type: 'pdf', title: 'Política e Programa Nacional de Plantas Medicinais e Fitoterápicos', description: 'Diretrizes para ampliar o acesso seguro a plantas medicinais e fitoterápicos. Ministério da Saúde, 2016.', file: 'politica-programa-plantas-2016.pdf'},
    {id: 'farmacia-viva', unit: 'unidade-2', page: 8, category: 'plantas', type: 'pdf', title: 'Portaria nº 886/2010 — Farmácia Viva', description: 'Portaria que regulamenta o Programa Farmácia Viva no âmbito do Sistema Único de Saúde.', file: 'portaria-886-2010-farmacia-viva.pdf'},
    {id: 'caderno-plantas', unit: 'unidade-2', page: 8, category: 'plantas', type: 'pdf', title: 'Plantas medicinais e fitoterapia na Atenção Básica', description: 'Caderno de Atenção Básica com orientações sobre plantas medicinais e fitoterapia nos serviços de saúde.', file: 'caderno-atencao-basica-plantas.pdf', image: './assets/images/unidades/unidade-02/figura2-plantas-uso-seguro.png'},
    {id: 'glossario', unit: 'unidade-2', page: 3, category: 'fundamentos', type: 'pdf', title: 'Glossário Temático de PICS', description: 'Termos e definições das práticas integrativas e complementares. Ministério da Saúde, 2018.', file: 'glossario-pics.pdf'},
    {id: 'tai-chi', unit: 'unidade-2', page: 3, category: 'praticas', type: 'pdf', title: 'Texto complementar — Tai Chi Chuan', description: 'Leitura de apoio sobre a origem, os princípios e os benefícios do Tai Chi Chuan.', file: 'texto-tai-chi-chuan.pdf', image: './assets/images/unidades/unidade-02/figura-tai-chi-chuan.png'},
    {id: 'guia-tci', unit: 'unidade-2', page: 8, category: 'territorio', type: 'pdf', title: 'Guia Prático de Implantação da Terapia Comunitária Integrativa', description: 'E-book da ABRATECOM com orientações para organizar e implantar rodas de TCI.', file: 'guia-tci-ebook.pdf', image: './assets/images/unidades/unidade-02/figura1-roda-tci.png'},

    {id: 'evidencias-yoga', unit: 'unidade-3', page: 2, category: 'yoga', type: 'pdf', title: 'Mapa de Evidências — Efetividade clínica da prática do Yoga', description: 'Material da BVS MTCI Américas citado na aula de Yoga.', configuredDocument: 'u3-mapa-evidencias-yoga.pdf'},
    {id: 'asana', unit: 'unidade-3', page: 2, category: 'yoga', type: 'pdf', title: 'Asana Pranayama Mudra Bandha', description: 'Obra de Swami Satyananda Saraswati sobre práticas de Yoga. Yoga Publications Trust, 2009.', configuredDocument: 'u3-asana-pranayama-mudra-bandha.pdf'},
    {id: 'yoga-nervosos', unit: 'unidade-3', page: 2, category: 'yoga', type: 'pdf', title: 'Yoga para Nervosos', description: 'Leitura complementar de Oswaldo Paulino indicada na aula sobre Yoga.', configuredDocument: 'u3-yoga-para-nervosos.pdf'},
    {id: 'evidencias-meditacao', unit: 'unidade-3', page: 3, category: 'yoga', type: 'pdf', title: 'Mapa de Evidências — Efetividade clínica da prática da Meditação', description: 'Material da BVS MTCI Américas citado na aula de Meditação.', configuredDocument: 'u3-mapa-evidencias-meditacao.pdf'},
    {id: 'arte-meditacao', unit: 'unidade-3', page: 3, category: 'yoga', type: 'pdf', title: 'A Arte da Meditação', description: 'Leitura complementar de Daniel Goleman indicada para aprofundar o estudo da Meditação.', configuredDocument: 'u3-arte-da-meditacao-goleman.pdf'},
    {id: 'curso-yoga', unit: 'unidade-3', page: 2, category: 'yoga', type: 'link', title: 'Curso AVASUS — Introdução às PICS: Yoga', description: 'Curso da plataforma AVASUS indicado como aprofundamento da aula de Yoga.', url: 'https://avasus.ufrn.br/local/avasplugin/cursos/curso.php?id=479'},
    {id: 'curso-meditacao', unit: 'unidade-3', page: 3, category: 'yoga', type: 'link', title: 'Curso AVASUS — Introdução às PICS: Meditação', description: 'Curso da plataforma AVASUS indicado como aprofundamento da aula de Meditação.', url: 'https://avasus.ufrn.br/local/avasplugin/cursos/curso.php?id=679'},
    {id: 'bvs-yoga', unit: 'unidade-3', page: 6, category: 'yoga', type: 'link', title: 'BVS MTCI — Evidências sobre Yoga', description: 'Página de referência sobre a efetividade clínica da prática do Yoga.', url: 'https://mtci.bvsalud.org/pt/efetividade-clinica-da-pratica-do-yoga'},
    {id: 'bvs-meditacao', unit: 'unidade-3', page: 6, category: 'yoga', type: 'link', title: 'BVS MTCI — Evidências sobre Meditação', description: 'Página de referência sobre a efetividade clínica da prática da Meditação.', url: 'https://mtci.bvsalud.org/pt/efetividade-clinica-da-pratica-da-meditacao'},

    {id: 'interprofissional', unit: 'unidade-4', page: 1, category: 'territorio', type: 'pdf', title: 'Trabalho interprofissional e as PICS na Atenção Primária', description: 'Leitura sobre os potenciais e desafios do trabalho interprofissional com as PICS na APS.', file: 'u4-trabalho-interprofissional-pics.pdf'},
    {id: 'pnab', unit: 'unidade-4', page: 2, category: 'politicas', type: 'pdf', title: 'Política Nacional de Atenção Básica (PNAB)', description: 'Diretrizes do Ministério da Saúde que orientam a organização e as ações da Atenção Básica.', file: 'u4-pnab.pdf'},
    {id: 'grupos-aps', unit: 'unidade-4', page: 2, category: 'territorio', type: 'pdf', title: 'Grupos na Atenção Básica à Saúde: uma tipologia por finalidades', description: 'Artigo sobre a classificação dos grupos educativos, terapêuticos e de convivência. Revista de APS, 2024.', file: 'u4-grupos-atencao-basica.pdf'},
    {id: 'pics-grupais', unit: 'unidade-4', page: 3, category: 'saberes', type: 'pdf', title: 'PICS grupais e o diálogo com a educação popular', description: 'Artigo sobre práticas integrativas coletivas e educação popular em saúde. Psicologia em Pesquisa, 2017.', file: 'u4-pics-grupais-educacao-popular.pdf'},
    {id: 'pnh', unit: 'unidade-4', page: 3, category: 'politicas', type: 'pdf', title: 'Política Nacional de Humanização (PNH)', description: 'Documento para gestores e trabalhadores do SUS sobre integralidade e humanização do cuidado.', file: 'u4-pnh.pdf'},
    {id: 'video-va4', unit: 'unidade-4', page: 4, category: 'territorio', type: 'video', title: 'PICS no território — vídeo VA4', description: 'Relato de experiência previsto na aula sobre o cuidado integral no território.', configKey: 'unitFourVideoUrl'},
    {id: 'video-territorio-1', unit: 'unidade-4', page: 4, category: 'territorio', type: 'video', title: 'PICS no território — programa de TV, bloco 1', description: 'Primeira parte do programa citado na unidade como referência para experiências com PICS no território.', url: 'https://globoplay.globo.com/v/14207578/?s=0s'},
    {id: 'video-territorio-2', unit: 'unidade-4', page: 4, category: 'territorio', type: 'video', title: 'PICS no território — programa de TV, bloco 2', description: 'Segunda parte do programa sobre práticas integrativas, disponível no Globoplay.', url: 'https://globoplay.globo.com/v/14207580/?s=0s'},
    {id: 'monitoramento', unit: 'unidade-4', page: 5, category: 'politicas', type: 'pdf', title: 'Relatório de monitoramento nacional das PICS', description: 'Material para acompanhar a implementação das práticas integrativas e complementares no SUS.', file: 'u4-relatorio-monitoramento-pics.pdf'},
    {id: 'milton-santos', unit: 'unidade-4', page: 5, category: 'territorio', type: 'pdf', title: 'Território na Geografia de Milton Santos', description: 'Artigo sobre território, relações de poder e trocas sociais. Sociedade & Natureza, 2016.', file: 'u4-territorio-milton-santos.pdf'},
    {id: 'pneps', unit: 'unidade-4', page: 5, category: 'saberes', type: 'pdf', title: 'Política Nacional de Educação Popular em Saúde (PNEPS-SUS)', description: 'Documento do Ministério da Saúde sobre educação popular em saúde, publicado em 2013.', file: 'u4-pneps.pdf'},
    {id: 'benzedores', unit: 'unidade-4', page: 5, category: 'saberes', type: 'pdf', title: 'Aspectos socioeconômicos e culturais de benzedores', description: 'Artigo sobre benzedores que utilizam plantas medicinais. Research, Society and Development, 2021.', file: 'u4-benzedores-2021.pdf'},
    {id: 'crencas-populares', unit: 'unidade-4', page: 5, category: 'saberes', type: 'pdf', title: 'Crenças populares referentes à saúde', description: 'Artigo sobre a apropriação de saberes socioculturais. Texto & Contexto — Enfermagem, 2006.', file: 'u4-crencas-populares-2006.pdf'},
    {id: 'aromaterapia', unit: 'unidade-4', page: 6, category: 'aromaterapia', type: 'pdf', title: 'Mapa de Evidências — Efetividade clínica da Aromaterapia', description: 'Material de apoio às oficinas que utilizam óleos e ervas nas práticas de cuidado.', file: 'u4-mapa-evidencias-aromaterapia.pdf'},
    {id: 'anvisa-plantas', unit: 'unidade-4', page: 6, category: 'plantas', type: 'pdf', title: 'Orientações sobre o uso de fitoterápicos e plantas medicinais', description: 'Cartilha da ANVISA sobre dosagem, contraindicações e cuidados com o uso de plantas medicinais, de 2022.', file: 'u4-orientacoes-fitoterapicos-anvisa.pdf', image: './assets/images/unidades/unidade-02/figura2-plantas-uso-seguro.png'},
    {id: 'contag-plantas', unit: 'unidade-4', page: 6, category: 'plantas', type: 'pdf', title: 'Plantas medicinais e fitoterápicos na agricultura familiar', description: 'Cartilha da CONTAG com recomendações práticas para cultivo seguro em quintais e hortas comunitárias, de 2024.', file: 'u4-cartilha-plantas-medicinais-contag.pdf'},
    {id: 'evidencias-plantas', unit: 'unidade-4', page: 6, category: 'plantas', type: 'pdf', title: 'Mapa de Evidências — Plantas Medicinais Brasileiras', description: 'Material sobre a efetividade clínica das plantas medicinais brasileiras, indicado para as oficinas de cultivo.', file: 'u4-mapa-evidencias-plantas-medicinais.pdf'},
    {id: 'pnps', unit: 'unidade-4', page: 7, category: 'politicas', type: 'pdf', title: 'Política Nacional de Promoção da Saúde (PNPS)', description: 'Documento de referência do Ministério da Saúde sobre a promoção da saúde.', file: 'u4-pnps.pdf'},
];

function safeResourceUrl(value) {
    if (typeof value !== 'string') return '';
    const url = value.trim();
    return /^(?:https?:\/\/|\.\/assets\/)[^\s]+$/i.test(url) ? url : '';
}

export function buildLibraryArtifacts(config = appConfig) {
    return records.map(record => {
        const unit = course.units.find(item => item.slug === record.unit);
        const url = safeResourceUrl(record.configuredDocument
            ? config.unitThreeDocuments?.[record.configuredDocument]
            : record.configKey ? config[record.configKey]
                : record.url || `./assets/documents/${record.unit}/${record.file}`);
        return Object.freeze({
            ...record,
            url,
            available: Boolean(url),
            unitLabel: unit.category,
            categoryLabel: libraryCategories.find(item => item.id === record.category).label,
            typeLabel: artifactTypes.find(item => item.id === record.type).label,
            image: record.image || unit.image,
            downloadable: record.type === 'pdf' || (record.type === 'video' && /\.(mp4|webm|ogv|ogg)(?:[?#]|$)/i.test(url)),
        });
    });
}

export const libraryArtifacts = Object.freeze(buildLibraryArtifacts());

function normalizeText(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

export function filterLibraryArtifacts(artifacts, {query = '', unit = '', category = '', type = ''} = {}) {
    const words = normalizeText(query).split(/\s+/).filter(Boolean);
    return artifacts.filter(artifact =>
        words.every(word => normalizeText(artifact.title).includes(word)) &&
        (!unit || artifact.unit === unit) &&
        (!category || artifact.category === category) &&
        (!type || artifact.type === type));
}
