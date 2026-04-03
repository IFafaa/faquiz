# Documentação FAQuiz (Cursor)

Leia primeiro **[PROJECT.md](./PROJECT.md)** — contém o contexto completo do monorepo, arquitetura, API, frontend, setup e armadilhas comuns.

Este diretório existe para orientar **pessoas** e **agentes de IA** ao desenvolver no repositório.

## Arquivos

| Arquivo | Conteúdo |
|---------|----------|
| [PROJECT.md](./PROJECT.md) | Visão geral, stack, pastas, fluxos de negócio, endpoints, Prisma, seed, web, convenções |

## Uso sugerido

- Ao abrir o projeto: carregar `PROJECT.md` como referência.
- Ao implementar features: respeitar a separação de camadas da API (`domain` → `application` → `infrastructure` → `presentation`).
- Ao alterar o fluxo do quiz: entender `rootNodeId`, `nextQuestionNodeId` e os use cases de sessão.
