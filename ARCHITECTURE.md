# Arquitetura do frontend

- `app`: rotas, metadados, layouts e composição dos entrypoints. Os handlers
  resolvem parâmetros e chamam operações HTTP em `services/server`.
- `features`: capacidades e composições de tela: autenticação, turmas, perfil,
  foto, acompanhamento, dashboard e Conselho. As telas server compõem dados e
  componentes; interação e estado ficam nas entradas `use client`.
- `domains/{identity,academics,classes,students,pedagogy,councils}`: contratos
  puros, autorização, validação, agregações, filtros e componentes do domínio.
- `components/shared`: padrões visuais da aplicação (métricas, vazios,
  breadcrumbs, aviso de integração e linhas de carregamento).
  `components/layout` contém o shell. Reserve `components/ui` para futuros
  primitivos realmente agnósticos; não há necessidade de um nesta migração.
- `services/server`: sessão, transporte, consultas, integração Cajuí e
  operações HTTP. Cada módulo tem `import "server-only"`.
  `services/contracts` contém contratos puros dos consumidores de integração
  e dashboard, também usados pelos mocks.
- `config/data-source.ts`: seleção server-only do modo mock.
  `lib`: formatação, paginação e estado de sincronização transversais.

## Dependências

`app` compõe features, domínios, shared e serviços. Features consomem essas
camadas; composições de tela podem montar capacidades como o avatar editável.
Domínios não importam features, app, serviços ou mocks. Shared não importa
domínios ou serviços. Contratos não importam implementação server. Imports são
diretos, sem barrels ou caminhos antigos de compatibilidade.

O grafo client não pode alcançar código server, inclusive por dependências
transitivas. `StudentIdentity` recebe `avatar: ReactNode`; a feature de foto
mantém estado/upload. Os rosters e avatares de perfil e Conselho permanecem
distintos, preservando seus comportamentos.

## Invariantes

Autorização está em `domains/identity/authorization.ts`; serviços validam sessão
e escopo antes das operações protegidas. Transporte mantém os contratos de
status, cookies, headers, timeout e mensagens de cada operação. Não unificar
proxies com `apiFetch` sem caracterizar essas diferenças.

Os mocks de relatório resumido e de experiência do Conselho são distintos.
Foto continua em memória do processo; registros continuam transitórios.
Sincronização é explícita e falhas preservam snapshot e último sucesso.

## Verificação

Execute `npm test`, `npm run typecheck`, `npm run lint`,
`npm run check:boundaries` e `npm run build -- --webpack`.
O verificador usa o parser TypeScript já instalado e testa violações com
fixtures temporárias. Não substitui o build nem a validação de runtime.
Webpack é a comparação desta migração devido à restrição ambiental do
Turbopack; o script padrão de build permanece inalterado.

Os testes cobrem regras puras, composição da foto, apresentação do Conselho e
contratos HTTP. Não há framework E2E nem validação de API institucional real.
