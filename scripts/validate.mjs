import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
    'index.html', 'assets/js/app.js', 'assets/css/app.css',
    'assets/js/data/units/introducao.js', 'assets/js/data/units/boas-vindas.js', 'assets/js/data/units/unidade-1.js',
    'assets/js/data/units/unidade-2.js', 'assets/css/unidade-2.css', 'assets/js/components/unit-two-tools.js',
    'assets/images/pnpic-main-logo.webp', 'assets/images/instituicoes-rodape.webp',
    'assets/images/unidades/unidade-01/figura-01-unidade-01.webp',
    'assets/images/unidades/unidade-01/figura-02-unidade-01.webp',
    'assets/images/unidades/unidade-01/figura-03-unidade-01.webp',
    'assets/images/unidades/unidade-01/historico-pics-sus.jpg',
    'assets/images/icones-de-conteudo/avaliacao-icon-maior.png',
    'assets/images/icones-de-conteudo/avaliacao-icon.png',
    'assets/images/icones-de-conteudo/baixar-recurso-icon.png',
    'assets/images/icones-de-conteudo/dialogando-com-pratica-icon-maior.png',
    'assets/images/icones-de-conteudo/dialogando-com-pratica-icon.png',
    'assets/images/icones-de-conteudo/glossario-icon-verde.png',
    'assets/images/icones-de-conteudo/lupa-mais-verde.png',
    'assets/images/icones-de-conteudo/material-complementar-icon-maior.png',
    'assets/images/icones-de-conteudo/saiba-mais-icon-maior.png',
    'assets/images/icones-de-conteudo/saiba-mais-icon.png',
    'assets/images/icones-de-conteudo/video-icon.png',
    'assets/images/slides-background/arquivos_enxoval_pnpic.jpg',
    'assets/images/slides-background/BG colorido.jpg',
    'assets/images/slides-background/BG.png',
    'assets/images/slides-background/caixa-de-dialogo.png',
    'assets/images/slides-background/Elementos.png',
    'assets/flipbook/css/flipbook.css',
    'assets/flipbook/js/flipbook.js',
    'assets/flipbook/pdf/HQ_page-0001.pdf',
    'assets/flipbook/pdf/HQ_page-0001.flipbook/manifest.json',
    'assets/video/css/video-component.css',
    'assets/video/js/video-component.js',
    'assets/horizontal-timeline/css/horizontal-timeline.css',
    'assets/horizontal-timeline/js/horizontal-timeline.js',
    'assets/pillar-stack/css/pillar-stack.css',
    'assets/pillar-stack/js/pillar-stack.js',
];
const missing = required.filter((relative) => !fs.existsSync(path.join(root, relative)));
if (missing.length) {
    console.error('Arquivos obrigatórios ausentes:', missing.join(', '));
    process.exit(1);
}

const flipbookRoot = path.join(root, 'assets/flipbook');
const flipbookManifestPath = path.join(flipbookRoot, 'pdf/HQ_page-0001.flipbook/manifest.json');
const flipbookManifest = JSON.parse(fs.readFileSync(flipbookManifestPath, 'utf8'));
const flipbookPages = Array.isArray(flipbookManifest.pages) ? flipbookManifest.pages : [];

if (flipbookManifest.version !== 1 || flipbookManifest.pageCount !== 7 || flipbookPages.length !== 7) {
    console.error('Manifesto do flipbook inválido: eram esperadas 7 páginas.');
    process.exit(1);
}

if (flipbookPages.some((page, index) => Number(page.number) !== index + 1)) {
    console.error('Manifesto do flipbook inválido: numeração de páginas inconsistente.');
    process.exit(1);
}

if (flipbookPages[0]?.type !== 'hard' || flipbookPages.at(-1)?.type !== 'hard') {
    console.error('Manifesto do flipbook inválido: as capas inicial e final devem ser rígidas.');
    process.exit(1);
}

const flipbookManifestDirectory = path.dirname(flipbookManifestPath);
const flipbookReferences = [
    {label: 'PDF de origem', value: flipbookManifest.sourcePdf},
    ...flipbookPages.flatMap((page) => [
        {label: `imagem da página ${page.number}`, value: page.src},
        {label: `miniatura da página ${page.number}`, value: page.thumb},
    ]),
];
const invalidFlipbookReferences = [];
const missingFlipbookReferences = [];

for (const reference of flipbookReferences) {
    if (typeof reference.value !== 'string' || !reference.value.trim() || /^[a-z][a-z\d+.-]*:/i.test(reference.value) || reference.value.startsWith('//')) {
        invalidFlipbookReferences.push(reference.label);
        continue;
    }

    const target = path.resolve(flipbookManifestDirectory, reference.value);
    const relativeToFlipbook = path.relative(flipbookRoot, target);
    if (relativeToFlipbook.startsWith('..') || path.isAbsolute(relativeToFlipbook)) {
        invalidFlipbookReferences.push(reference.label);
    } else if (!fs.existsSync(target)) {
        missingFlipbookReferences.push(reference.label);
    }
}

if (invalidFlipbookReferences.length || missingFlipbookReferences.length) {
    if (invalidFlipbookReferences.length) console.error('Referências inválidas no flipbook:', invalidFlipbookReferences.join(', '));
    if (missingFlipbookReferences.length) console.error('Arquivos referenciados pelo flipbook ausentes:', missingFlipbookReferences.join(', '));
    process.exit(1);
}

const flipbookPdfPath = path.resolve(flipbookManifestDirectory, flipbookManifest.sourcePdf);
const flipbookPdfSignature = fs.readFileSync(flipbookPdfPath).subarray(0, 5).toString('ascii');
if (flipbookPdfSignature !== '%PDF-') {
    console.error('PDF do flipbook inválido: assinatura PDF não encontrada.');
    process.exit(1);
}

const shellHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const asset of [
    './assets/flipbook/css/flipbook.css',
    './assets/flipbook/js/flipbook.js',
    './assets/video/css/video-component.css',
    './assets/video/js/video-component.js',
    './assets/horizontal-timeline/css/horizontal-timeline.css',
    './assets/horizontal-timeline/js/horizontal-timeline.js',
    './assets/pillar-stack/css/pillar-stack.css',
    './assets/pillar-stack/js/pillar-stack.js',
]) {
    const occurrences = shellHtml.split(asset).length - 1;
    if (occurrences !== 1) {
        console.error(`Integração de componente inválida: ${asset} deve ser carregado exatamente uma vez.`);
        process.exit(1);
    }
}

const files = [];
function walk(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full); else files.push(full);
    }
}
walk(root);
const forbidden = files.filter((file) => /#U00|[À-ž]/.test(path.basename(file)));
if (forbidden.length) {
    console.error('Nomes de arquivo não portáveis:', forbidden.map((f) => path.relative(root, f)).join(', '));
    process.exit(1);
}
console.log(`Validação concluída: ${files.length} arquivos verificados.`);
