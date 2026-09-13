// Transcrição do infográfico figura2-plantas-uso-seguro.png, organizada em slides.
const slides = [
    {
        title: 'Horário ideal de coleta',
        stage: 'Coleta',
        content: `<p>Manhã, após a evaporação do orvalho, ou no final da tarde, em dias ensolarados.</p>
            <p>Evite plantas úmidas para prevenir fermentação e fungos.</p>`,
    },
    {
        title: 'Partes da planta',
        stage: 'Coleta',
        content: `<p><strong>Flores:</strong> quando estiverem prestes a abrir.</p>
            <p><strong>Raízes e rizomas:</strong> no outono e no inverno, quando concentram mais princípios ativos.</p>`,
    },
    {
        title: 'Secagem imediata',
        stage: 'Após a colheita',
        content: `<p>Inicie a secagem no mesmo dia da colheita.</p>
            <p>Descarte folhas danificadas, furadas, mofadas ou com insetos.</p>`,
    },
    {
        title: 'Preparo seguro',
        stage: 'Preparo',
        content: `<ul>
            <li>Use recipientes de vidro, esmalte ou inox. Evite alumínio.</li>
            <li>Medida padrão: 1 colher de chá para 1 copo de água.</li>
            <li>Folhas e flores: prepare por infusão; não ferva.</li>
            <li>Consuma os chás em até 24 horas.</li>
        </ul>`,
    },
    {
        title: 'Armazenamento',
        stage: 'Conservação',
        content: `<ul>
            <li>Mantenha as plantas limpas, secas e bem armazenadas, em local protegido da luz, umidade, insetos e contaminações.</li>
            <li>Prefira plantas com rótulo contendo nome, data e indicação de uso.</li>
        </ul>`,
    },
    {
        title: 'Doses elevadas e plantas mofadas',
        stage: 'Riscos do uso inadequado',
        warning: true,
        content: `<section><h5>Doses elevadas</h5>
            <p>Espécies como espirradeira, confrei, cabacinha e comigo-ninguém-pode podem causar intoxicações graves quando usadas em excesso ou por períodos prolongados.</p></section>
            <section><h5>Plantas mofadas</h5>
            <p>Podem conter aflatoxinas com potencial cancerígeno. Descarte sempre o material comprometido.</p></section>`,
    },
    {
        title: 'Identificação e interações',
        stage: 'Riscos do uso inadequado',
        warning: true,
        content: `<section><h5>Identificação incorreta</h5>
            <p>O risco aumenta ao comprar plantas em pó ou a granel. Pode haver confusão entre espécies.</p></section>
            <section><h5>Interações medicamentosas</h5>
            <p>A combinação de chás com medicamentos pode provocar efeitos perigosos. Misturar muitas ervas pode gerar interações imprevisíveis.</p></section>`,
    },
    {
        title: 'Atenção especial:',
        stage: 'Cuidados finais',
        warning: true,
        content: `<p>gestantes e pessoas em tratamento medicamentoso devem ter cuidado redobrado.</p>
            <p class="u2-plant-safety__reminder"><strong>Chá não é água:</strong> o uso excessivo pode trazer riscos à saúde. Busque sempre orientação adequada.</p>`,
    },
];

export function plantSafetyCarousel() {
    return `<figure class="pics-policy-slider u2-plant-safety" data-content-slider aria-labelledby="u2-plant-safety-title" aria-describedby="u2-plant-safety-caption">
        <header class="pics-policy-slider__header u2-plant-safety__header">
            <h3 id="u2-plant-safety-title">Plantas medicinais: uso seguro, orientações básicas e riscos do uso inadequado</h3>
        </header>
        <div class="pics-policy-slider__viewport">
            ${slides.map((slide, index) => `<article class="u2-plant-safety__slide${slide.warning ? ' u2-plant-safety__slide--warning' : ''}" id="u2-plant-safety-panel-${index + 1}" role="tabpanel" tabindex="0" data-content-slide aria-labelledby="u2-plant-safety-tab-${index + 1}">
                <div class="u2-plant-safety__lead">
                    ${slide.warning ? '<img src="./assets/images/icones-de-conteudo/atencao-icon.png" width="1254" height="1254" alt="" aria-hidden="true" loading="lazy" decoding="async">' : ''}
                    <p class="u2-plant-safety__step">${slide.stage} · ${String(index + 1).padStart(2, '0')}</p>
                </div>
                <h4>${slide.title}</h4>
                <div class="u2-plant-safety__copy">${slide.content}</div>
            </article>`).join('')}
        </div>
        <div class="pics-policy-slider__controls">
            <button type="button" data-slide-previous aria-label="Mostrar página anterior sobre uso seguro de plantas"><span aria-hidden="true">←</span> Anterior</button>
            <div class="pics-policy-slider__steps" role="tablist" aria-label="Páginas sobre uso seguro de plantas">
                ${slides.map((slide, index) => `<button type="button" id="u2-plant-safety-tab-${index + 1}" role="tab" data-slide-to="${index}" aria-controls="u2-plant-safety-panel-${index + 1}" aria-label="Página ${index + 1}: ${slide.title}">${String(index + 1).padStart(2, '0')}</button>`).join('')}
            </div>
            <p class="pics-policy-slider__status" data-slide-status aria-live="polite" aria-atomic="true">1 de ${slides.length}</p>
            <button type="button" data-slide-next aria-label="Mostrar próxima página sobre uso seguro de plantas">Próxima <span aria-hidden="true">→</span></button>
        </div>
        <figcaption id="u2-plant-safety-caption">Figura 2 – Uso seguro de plantas medicinais: orientações de coleta, preparo, armazenamento e prevenção de riscos.</figcaption>
    </figure>`;
}
