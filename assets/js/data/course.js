import {introductionUnit} from './units/introducao.js';
import {welcomeUnit} from './units/boas-vindas.js';
import {unitOne} from './units/unidade-1.js';
import {unitTwo} from './units/unidade-2.js';
import {unitThree} from './units/unidade-3.js';
import {unitFour} from './units/unidade-4.js';

export const course = Object.freeze({
    id: 'pics-modulo-01',
    title: 'Práticas Integrativas e Complementares em Saúde (PICS) na atuação de Agentes Comunitários de Saúde e Agentes de Combate às Endemias',
    shortTitle: 'PICS para ACS e ACE',
    stats: [
        {number: '01.', label: 'Carga Horária', value: '60 horas'},
        {number: '02.', label: 'Número de Unidades', value: '6 unidades'},
        {number: '03.', label: 'Com Certificação', value: 'Sim. Pela totalidade do curso.'},
        {number: '04.', label: 'Público-alvo', value: 'Agentes Comunitários de Saúde e Agentes de Combate às Endemias e demais interessados, sem restrição de público a quem se destina.'},
    ],
    units: [
        {
            slug: 'introducao', category: 'Introdução', title: 'Apresentação',
            description: 'Conheça a estrutura, os objetivos e os conteúdos do módulo.',
            image: './assets/images/unidades/introducao.webp', available: true,
        },
        {
            slug: 'boas-vindas', category: 'Boas-Vindas', title: 'Boas-Vindas',
            description: 'Inicie o percurso com uma mensagem de acolhimento e apresentação da caminhada formativa.',
            image: './assets/images/unidades/boas-vindas.webp', available: true,
        },
        {
            slug: 'unidade-1', category: 'Unidade 1', title: 'Introdução às PICS no SUS: princípios e bases legais',
            description: 'Conheça os fundamentos das PICS, sua organização no SUS e suas bases legais.',
            image: './assets/images/unidades/unidade-01.webp', available: true,
        },
        {
            slug: 'unidade-2', category: 'Unidade 2', title: unitTwo.title,
            description: 'Aprofunde práticas integrativas e reflita sobre limites, segurança e responsabilidade.',
            image: './assets/images/unidades/unidade-02.webp', available: true,
        },
        {
            slug: 'unidade-3', category: 'Unidade 3', title: unitThree.title,
            description: 'Esta aula apresenta os fundamentos filosóficos e práticos do Yoga e da Meditação e discute sua aplicação segura nos espaços de saúde.',
            image: './assets/images/unidades/unidade-03.webp', available: true,
        },
        {
            slug: 'unidade-4', category: 'Unidade 4', title: 'Campo de atuação no território e PICS como estratégia de cuidado integral',
            description: 'Esta unidade apresenta o território como campo de atuação do ACS e do ACE e discute as PICS como estratégia de cuidado integral, incluindo grupos, oficinas, rodas de conversa, mutirões e a articulação com as práticas populares de saúde.',
            image: './assets/images/unidades/unidade-04.webp', available: true,
        },
        {
            slug: 'conclusao', category: 'Conclusão', title: 'Autoavaliação e Avaliação do módulo',
            description: 'Revise os aprendizados e realize a avaliação final do módulo.',
            image: './assets/images/unidades/conclusao.webp', available: false,
        },
    ],
});

export const unitsBySlug = new Map([
    [introductionUnit.slug, introductionUnit],
    [welcomeUnit.slug, welcomeUnit],
    [unitOne.slug, unitOne],
    [unitTwo.slug, unitTwo],
    [unitThree.slug, unitThree],
    [unitFour.slug, unitFour],
]);
