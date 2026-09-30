<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Fronteiras da aplicação

- Consulte `ARCHITECTURE.md`; mantenha `app` como roteamento/composição.
- Contratos e regras puras ficam em `domains`; não importam features ou server.
- I/O, sessão e integrações ficam em `services/server`, com `server-only`.
  Mocks e UI importam contratos puros, nunca tipos desses módulos.
- Shared contém padrões da aplicação; UI é reservado a primitivos agnósticos.
  Prefira imports diretos, sem barrels ou reexports de compatibilidade.
- Preserve DOM/classes, autorização, respostas HTTP e peculiaridades dos mocks
  nas refatorações. A identidade recebe o avatar como slot; upload fica na feature.
- Valide lotes com testes pertinentes; ao finalizar rode testes, typecheck,
  lint, `npm run check:boundaries` e build. Nesta máquina, use
  `npm run build -- --webpack` para contornar a limitação ambiental do Turbopack.
