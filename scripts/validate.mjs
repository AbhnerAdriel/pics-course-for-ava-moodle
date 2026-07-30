import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
    'index.html', 'assets/js/app.js', 'assets/css/app.css',
    'assets/js/data/units/introducao.js', 'assets/js/data/units/boas-vindas.js',
    'assets/images/pnpic-main-logo.webp', 'assets/images/instituicoes-rodape.webp',
];
const missing = required.filter((relative) => !fs.existsSync(path.join(root, relative)));
if (missing.length) {
    console.error('Arquivos obrigatórios ausentes:', missing.join(', '));
    process.exit(1);
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
