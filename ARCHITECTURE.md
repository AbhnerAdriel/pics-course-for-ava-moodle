# Arquitetura

## Decisões principais

### Roteamento por hash

Foi escolhido um roteador por fragmento (`#/...`) por ser a opção mais robusta para um pacote HTML hospedado no Moodle. Rotas com History API exigiriam que o servidor redirecionasse todo endereço interno para `index.html`, algo que não pode ser pressuposto em URLs de `pluginfile.php`.

### JavaScript modular sem framework

O projeto possui poucas telas e não necessita do custo operacional de um framework. Foram usados módulos ES nativos, componentes pequenos e dados separados da apresentação. Isso reduz dependências, simplifica a atualização dentro do Moodle e elimina uma etapa de build obrigatória.

### Persistência desacoplada

`ProgressStore` cuida da persistência local. `MoodleBridge` expõe um contrato opcional para persistência no Moodle. Assim, o pacote estático é utilizável agora e pode evoluir para um módulo de atividade (`mod_`) sem reescrever a interface.

## Estrutura

```text
assets/js/
├── app.js                  # composição e ciclo de vida
├── config.js               # URLs configuráveis
├── components/             # menu, animações e interações
├── core/                   # roteador, estado e estilos por rota
├── data/                   # metadados e conteúdo das unidades
├── services/               # ponte opcional com Moodle
└── views/                  # renderização da página inicial e das unidades
```

## Segurança e robustez

- não há execução de conteúdo vindo do usuário;
- não há dependências remotas de JavaScript;
- links externos recebem `noopener noreferrer`;
- o adaptador Moodle é opcional e encapsulado;
- falhas de `localStorage` não impedem o acesso ao conteúdo;
- nomes de arquivos foram normalizados para evitar problemas de codificação em servidores Linux.
