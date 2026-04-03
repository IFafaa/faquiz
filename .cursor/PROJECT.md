# FAQuiz — Documentação de projeto

Monorepo com **API NestJS** (Clean Architecture / DDD) e **SPA React** (Vite). Quizzes são **árvores de decisão**: cada pergunta (`QuestionNode`) tem opções (`AnswerOption`) que apontam para a **próxima** pergunta ou encerram a sessão.

---

## 1. Visão do produto

- **Respondente (público):** abre um quiz publicado, inicia sessão, responde perguntas em sequência **não linear** (definida pelas arestas da árvore). Tipos de pergunta: `multiple_choice`, `text`, `rating`.
- **Admin:** login JWT, CRUD de quizzes, **builder visual** (React Flow + layout dagre), URL pública + QR, dashboard com métricas e lista de sessões/respostas.

---

## 2. Estrutura de pastas

```
faquiz/
├── faquiz-api/          # Backend NestJS + Prisma + SQLite
│   ├── prisma/          # schema.prisma, migrations, seed.ts
│   ├── generated/prisma # Cliente Prisma gerado (gitignored)
│   └── src/
│       ├── domain/           # Entidades, repositórios (interfaces), VOs, erros
│       ├── application/      # Use cases (orquestração)
│       ├── infrastructure/   # Prisma, JWT, implementações de repositório
│       └── presentation/     # Controllers, DTOs, guards, filtros
├── faquiz-web/          # Frontend Vite + React + Tailwind
│   └── src/
│       ├── api/         # Cliente Axios + funções por recurso
│       ├── components/  # UI, quiz, builder
│       ├── hooks/       # useQuizSession (fluxo público)
│       ├── pages/       # Rotas públicas e admin
│       ├── stores/      # Zustand (auth, quiz session)
│       └── types/       # Tipos alinhados à API
└── .cursor/             # Esta documentação
```

---

## 3. Stack e requisitos

| Área | Tecnologias |
|------|-------------|
| Runtime | Node.js **20+** (recomendado **22 LTS**) |
| API | NestJS 11, class-validator, Passport JWT |
| Persistência | Prisma 7, SQLite (`dev.db`), adapter `better-sqlite3` |
| Web | React 19, Vite 8, React Router 7, TanStack Query 5, Zustand 5 |
| UI pública | Framer Motion, Tailwind 4 |
| Builder | `@xyflow/react` (React Flow 12), `dagre` (layout) |
| Gráficos admin | Recharts |

---

## 4. Backend — arquitetura

### Camadas

1. **`domain/`** — Regras e modelo puro: entidades (`Quiz`, `QuestionNode`, `AnswerOption`, `QuizSession`, …), **interfaces** de repositório (`IQuizRepository`, `IQuizSessionRepository`, …), value objects (`QuestionType`, `SessionStatus`), erros de domínio (`NotFoundError`, `ValidationError`, …).
2. **`application/`** — **Use cases** por caso de uso (login, CRUD quiz, salvar árvore, iniciar sessão, submeter resposta, analytics, share/QR). Não importar Nest aqui; dependências via interfaces injetadas.
3. **`infrastructure/`** — Implementações Prisma (`prisma-*-repository.ts`), `PrismaService`, módulo Prisma, JWT strategy/guard, serviços (ex.: QR).
4. **`presentation/`** — Controllers REST, DTOs, `ValidationPipe`, `JwtAuthGuard`, filtro de exceções de domínio.

### Path aliases (TypeScript)

Configurados em `faquiz-api/tsconfig.json`:

- `@domain/*` → `src/domain/*`
- `@application/*` → `src/application/*`
- `@infrastructure/*` → `src/infrastructure/*`
- `@presentation/*` → `src/presentation/*`

### Imports em runtime (ESM)

Arquivos compilados usam sufixo **`.js`** nos imports relativos (ex.: `'./app.module.js'`). Manter o mesmo padrão no código-fonte TypeScript.

### Prisma

- **Schema:** `faquiz-api/prisma/schema.prisma`
- **Cliente gerado em:** `faquiz-api/generated/prisma` (pasta **ignorada no Git**).
- **Generator:** `provider = "prisma-client"` com **`moduleFormat = "cjs"`** — necessário para o bundle Nest carregar o client sem erro `exports is not defined in ES module scope`.
- Após clone ou mudança de schema: `cd faquiz-api && npx prisma generate && npx prisma migrate dev` (conforme README raiz).

### Modelo de dados (conceito)

- **`Quiz`:** `rootNodeId` = ID do **primeiro** `QuestionNode` da sessão.
- **`QuestionNode`:** pergunta; `questionType` string alinhada ao VO (`multiple_choice`, `text`, `rating`).
- **`AnswerOption`:** `nextQuestionNodeId` opcional — **próximo nó** ao escolher a opção; `null` = **fim do fluxo** (sessão completa após essa resposta, no fluxo de múltipla escolha).

Fluxo da sessão reconstrói o “nó atual” percorrendo as respostas desde a raiz e seguindo a opção escolhida (`SubmitAnswerUseCase` + `resolveCurrentQuestionId`).

---

## 5. API — endpoints (prefixo global `/api`)

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Body: email/senha → JWT |

### Quizzes — admin (Bearer JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/quizzes` | Lista quizzes do admin |
| POST | `/quizzes` | Criar |
| GET | `/quizzes/:id` | Detalhe |
| PUT | `/quizzes/:id` | Atualizar (título, descrição, `isPublished`) |
| DELETE | `/quizzes/:id` | Excluir |
| GET | `/quizzes/:id/tree` | Snapshot da árvore (nós + opções + next) |
| PUT | `/quizzes/:id/tree` | Salvar árvore (`rootNodeId` + nós com posições e opções) |
| GET | `/quizzes/:id/share` | URL pública + QR base64 |
| GET | `/quizzes/:id/analytics` | Totais + `sessionsPerDay` (últimos N dias, **datas em UTC**) |
| GET | `/quizzes/:id/sessions` | Lista sessões |

### Quizzes — público (sem JWT)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/quizzes/:id/public` | Quiz publicado + primeira pergunta (raiz) |
| POST | `/quizzes/:id/sessions` | Iniciar sessão (`respondentName` opcional) |

### Sessão — público

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/sessions/:id/answers` | Submeter resposta (`answerOptionId` ou `answerValue` conforme tipo) |

### Sessão — admin

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/sessions/:id` | Detalhe da sessão + respostas |

### CORS

Configurado em `main.ts` com `FRONTEND_URL` (ex.: `http://localhost:5173`).

### Variáveis de ambiente (API)

Exemplo típico (`.env`):

- `DATABASE_URL` — SQLite: `file:./dev.db`
- `JWT_SECRET`, `JWT_EXPIRATION`
- `PORT` — padrão `3333`
- `FRONTEND_URL` — origem permitida no CORS

---

## 6. Analytics (`sessionsPerDay`)

- Agrega sessões por **dia em UTC** usando `startedAt.toISOString().slice(0, 10)`.
- A janela é os **últimos N dias incluindo hoje** (UTC), para não “perder” sessões iniciadas no dia corrente no gráfico.
- Respostas próximas à meia-noite no fuso local podem cair no dia anterior/posterior em UTC — comportamento esperado até haver suporte a fuso explícito.

---

## 7. Seed (`faquiz-api/prisma/seed.ts`)

- Cria admin padrão (email/senha definidos no script — ver console após rodar).
- Cria quiz de exemplo **“Pesquisa Gen Z…”** com árvore longa; ramificação na **pergunta 9** (uso prévio de cigarro eletrônico): **Sim** → bloco extra; **Não** → pula para a parte comum.
- **ID fixo do quiz de seed** (para URLs estáveis após cada `seed`):  
  `cafebabe-0000-4000-8000-00000000a001`
- O seed remove quiz existente com o **mesmo título** antes de recriar.

Comando: `cd faquiz-api && npm run prisma:seed` (equivale a `tsx prisma/seed.ts`).

---

## 8. Frontend (`faquiz-web`)

### Configuração

- **`VITE_API_URL`** — base da API, ex.: `http://localhost:3333/api` (arquivo `.env`, não commitado; há `.env.example`).
- Cliente Axios em `src/api/client.ts` injeta `Authorization` a partir do `authStore`.

### Rotas principais (`App.tsx`)

- Público: `/`, `/quiz/:id`, `/quiz/:id/play`, `/quiz/:id/complete`
- Admin: `/admin/login`, `/admin`, `/admin/quizzes`, `/admin/quizzes/:id/build`, `.../settings`, `.../responses`, `/admin/sessions/:id`

### Fluxo público do quiz

- **`useQuizStartFlow`** — carrega quiz público, valida raiz, `startSession`, navega para `/play`.
- **`useQuizPlayFlow`** — exige sessão alinhada ao `quizId`; `submitAnswer` até `completed` ou erro.
- Estado em **`quizSessionStore`** (Zustand): fase, `sessionId`, pergunta atual, etc.

### Admin

- **Dashboard:** agrega analytics de todos os quizzes; gráfico `sessionsPerDay`.
- **Lista / CRUD** de quizzes; **builder** com React Flow; **settings** (URL + QR); **respostas** e **detalhe de sessão**.

### Builder

- `treeToFlow` / `flowToSavePayload` / `getLayoutedElements` em `components/builder/flow-utils.ts`.
- Nós customizados: `QuestionFlowNode`; handles por opção (`opt-<id>`).
- Tipos de nó: `QuestionNodeData` estende `Record<string, unknown>` por exigência do React Flow 12.

### Tipos compartilhados

- `src/types/api.ts` — alinhado aos payloads JSON da API.

---

## 9. Como rodar localmente (resumo)

**API**

```bash
cd faquiz-api
cp .env.example .env   # se ainda não existir
npm install
npx prisma migrate dev
npx prisma generate
npx tsx prisma/seed.ts   # opcional
npm run start:dev
```

**Web**

```bash
cd faquiz-web
cp .env.example .env
npm install
npm run dev
```

URLs: API `http://localhost:3333/api`, app `http://localhost:5173`.

---

## 10. Testes e qualidade

- API: `npm run test`, `npm run lint` (ajustar conforme `package.json`).
- Web: `npm run build`, `npm run lint`.

---

## 11. Boas práticas para PRs / agentes

- **API:** novas regras de negócio no **domínio/application**; persistência atrás de interfaces já existentes ou novas interfaces + implementação Prisma.
- **Evitar** alterar comportamento de `SubmitAnswerUseCase` sem entender `nextQuestionNodeId` e ordem das respostas.
- **Prisma:** após mudar `schema.prisma`, gerar client e criar migration.
- **Frontend:** manter padrão de componentes em `components/ui`; não expandir escopo sem necessidade.
- **Documentação:** atualizar este arquivo se mudar contratos de API, fluxo de sessão ou setup.

---

## 12. Glossário rápido

| Termo | Significado |
|-------|-------------|
| Raiz | `Quiz.rootNodeId` — primeira pergunta exibida após iniciar sessão |
| Ramo | Sequência de nós definida pelas opções escolhidas (`nextQuestionNodeId`) |
| Sessão completa | Última resposta levou a `nextQuestionNodeId === null` (ou fluxo equivalente) |

---

*Última atualização: documentação gerada para o repositório FAQuiz (monorepo `faquiz-api` + `faquiz-web`).*
