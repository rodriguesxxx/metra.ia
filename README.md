# Métrica Educacional

Frontend de acompanhamento acadêmico e Conselho de Classe.

## Pré-requisitos

| Tecnologia | Versão | Site |
| --- | --- | --- |
| Node.js | 22 ou 24 | [nodejs.org](https://nodejs.org/en) |
| Next.js | 16.3.4 | [nextjs.org](https://nextjs.org) |
| React | 19.3.0 | [react.dev](https://react.dev) |
| TypeScript | 5.8.3 | [typescriptlang.org](https://www.typescriptlang.org) |
| Tailwind CSS | 4.3.3 | [tailwindcss.com](https://tailwindcss.com) |
| Zod | 4.6.2 | [zod.dev](https://zod.dev) |
| Vitest | 4.0.18 | [vitest.dev](https://vitest.dev) |

## Arquitetura

`src/app`: rotas · `src/features`: telas · `src/domains`: regras e contratos · `src/components`: interface · `src/services/server`: dados e integrações. [Detalhes](ARCHITECTURE.md).

## Execução

```bash
npm ci
METRA_DATA_SOURCE=mock npm run dev
```

Acesse [localhost:3000/login](http://localhost:3000/login).

## Usuário e senha para testes

Com o comando acima: **usuário** `teste@exemplo.com` · **senha** `teste123`.
