# Plano FAQuiz e convenção de commits

Este documento descreve o fluxo Git do monorepo FAQuiz: **um commit por step concluído**, para manter o histórico rastreável. O plano completo permanece no Cursor (plano FAQuiz Platform).

## Convenção de mensagens

- Formato sugerido: `tipo(escopo): fase X.Y — descrição curta`
- Tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
- Escopos: `api`, `web`, `repo`

Exemplos:

- `feat(api): fase 1.1 — setup NestJS, Prisma, schema e migrate`
- `feat(api): fase 1.2 — camada domain (entidades e repositórios)`
- `feat(web): fase 2.1 — setup Vite, Tailwind e roteamento`

## Steps e histórico de commits

| Step | Descrição | Commit |
|------|-----------|--------|
| Fase 1.1 | Backend: NestJS, Prisma SQLite, schema, migrate, estrutura de pastas, seed | `db3e6a2` |
| Fase 1.2 | Domain: entidades, VOs, interfaces de repositório, erros | pendente |
| Fase 1.3 | Infrastructure: PrismaService, repos, mappers, JWT, QR | pendente |
| Fase 1.4 | Application: use cases | pendente |
| Fase 1.5 | Presentation: controllers, DTOs, módulos | pendente |
| Fase 2.1 | Frontend: Vite, Tailwind, deps | pendente |
| Fase 2.2 | Frontend: API client, stores, UI base | pendente |
| Fase 3 | Quiz público + animações | pendente |
| Fase 4 | Admin + builder | pendente |
| Fase 5 | Polimento | pendente |

## Próximo passo

Implementar **Fase 1.2** (camada domain) e abrir um commit dedicado ao finalizar.
