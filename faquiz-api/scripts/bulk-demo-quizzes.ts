import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const API_BASE_URL = (process.env.API_BASE_URL ?? 'http://localhost:3333/api').replace(
  /\/$/,
  '',
);
const DATABASE_URL = process.env.DATABASE_URL;
const USER_EMAIL =
  process.env.FAQUIZ_USER_EMAIL ??
  process.env.ADMIN_EMAIL ??
  'admin@faquiz.com';
const USER_PASSWORD =
  process.env.FAQUIZ_USER_PASSWORD ??
  process.env.ADMIN_PASSWORD ??
  process.env.ADMIN_SEED_PASSWORD ??
  'admin123';
const SESSIONS_PER_QUIZ = Math.max(
  1,
  Number.parseInt(process.env.SESSIONS_PER_QUIZ ?? '500', 10) || 500,
);
const PRISMA_BATCH = Math.max(
  1,
  Number.parseInt(process.env.PRISMA_BATCH ?? '40', 10) || 40,
);

type TreeNodePayload = {
  id: string;
  title: string;
  description: string;
  questionType: string;
  positionX: number;
  positionY: number;
  answerOptions: Array<{
    id: string;
    label: string;
    value: string;
    order: number;
    nextQuestionNodeId: string | null;
  }>;
};

type QuizBlueprint = {
  title: string;
  description: string;
  questions: Array<{
    title: string;
    description: string;
    options: Array<{ label: string; value: string }>;
  }>;
};

const QUIZ_BLUEPRINTS: QuizBlueprint[] = [
  {
    title: 'Cosmos em 4 toques: o que você sabe sobre o universo?',
    description:
      '<p>Um micro-quiz sobre estrelas, exoplanetas e curiosidades do céu noturno.</p>',
    questions: [
      {
        title: 'Qual destes corpos celestes é uma estrela?',
        description: '',
        options: [
          { label: 'Vênus', value: 'venus' },
          { label: 'Sol', value: 'sun' },
          { label: 'Lua', value: 'moon' },
          { label: 'Io (lua de Júpiter)', value: 'io' },
        ],
      },
      {
        title: 'A Via Láctea é principalmente…',
        description: '',
        options: [
          { label: 'Uma galáxia espiral', value: 'spiral' },
          { label: 'Um buraco negro único', value: 'single_bh' },
          { label: 'Um aglomerado de estrelas sem forma', value: 'cluster' },
          { label: 'Um planeta gigante', value: 'giant' },
        ],
      },
      {
        title: 'O que significa “ano-luz”?',
        description: '',
        options: [
          { label: 'Tempo que a luz leva em 1 ano', value: 'distance' },
          { label: 'Idade de uma estrela', value: 'star_age' },
          { label: 'Brilho aparente', value: 'brightness' },
          { label: 'Massa do Sol', value: 'solar_mass' },
        ],
      },
      {
        title: 'Você embarcaria numa missão para Marte se fosse só ida?',
        description: '',
        options: [
          { label: 'Sim, com café reutilizável', value: 'yes_coffee' },
          { label: 'Só se houver Wi‑Fi estável', value: 'yes_wifi' },
          { label: 'Prefiro observar da Terra', value: 'earth' },
          { label: 'Só com playlist retrô', value: 'retro' },
        ],
      },
    ],
  },
  {
    title: 'Sabores do mundo: seu mapa gastronômico imaginário',
    description:
      '<p>Combinações improváveis, memórias afetivas e um pitada de humor culinário.</p>',
    questions: [
      {
        title: 'Para um café da manhã ideal, você escolhe…',
        description: '',
        options: [
          { label: 'Pão de queijo + guaraná', value: 'br' },
          { label: 'Croissant + espresso', value: 'fr' },
          { label: 'Congee + chá', value: 'asia' },
          { label: 'Shakshuka + sumo fresco', value: 'med' },
        ],
      },
      {
        title: 'Um ingrediente que sempre salva o prato é…',
        description: '',
        options: [
          { label: 'Limão', value: 'lemon' },
          { label: 'Manteiga clarificada', value: 'ghee' },
          { label: 'Shoyu envelhecido', value: 'soy' },
          { label: 'Ervas frescas', value: 'herbs' },
        ],
      },
      {
        title: 'Doce ou salgado à tarde?',
        description: '',
        options: [
          { label: 'Doce, mas sem exagero', value: 'sweet' },
          { label: 'Salgado e crocante', value: 'savory' },
          { label: 'Depende do clima', value: 'weather' },
          { label: 'Os dois, em camadas', value: 'both' },
        ],
      },
      {
        title: 'Se pudesse aprender uma técnica nova hoje…',
        description: '',
        options: [
          { label: 'Fermentação natural', value: 'ferment' },
          { label: 'Sous-vide criativo', value: 'sousvide' },
          { label: 'Carvão japonês (binchotan)', value: 'binchotan' },
          { label: 'Confeitaria molecular', value: 'molecular' },
        ],
      },
    ],
  },
  {
    title: 'RetroGames: em qual console sua nostalgia mora?',
    description:
      '<p>De fliperama a handheld — escolhas difíceis e pixels inesquecíveis.</p>',
    questions: [
      {
        title: 'Qual era o seu “primeiro amor” em videogame?',
        description: '',
        options: [
          { label: 'Atari / MSX vibes', value: 'atari' },
          { label: 'NES / Master System', value: '8bit' },
          { label: 'PlayStation / Saturn era', value: '32bit' },
          { label: 'PC + shareware nos anos 90', value: 'pc90s' },
        ],
      },
      {
        title: 'Um gênero que você nunca enjoa…',
        description: '',
        options: [
          { label: 'Plataforma 2D', value: 'platform' },
          { label: 'RPG por turnos', value: 'rpg' },
          { label: 'Corrida arcade', value: 'racing' },
          { label: 'Beat ’em up cooperativo', value: 'beatemup' },
        ],
      },
      {
        title: 'Save ou password?',
        description: '',
        options: [
          { label: 'Cartucho com bateria', value: 'battery' },
          { label: 'Código de 24 caracteres', value: 'password' },
          { label: 'Checkpoint cruel', value: 'checkpoint' },
          { label: 'Continues infinitos (nem existia)', value: 'infinite' },
        ],
      },
      {
        title: 'Hoje você jogaria…',
        description: '',
        options: [
          { label: 'Um Metroidvania denso', value: 'metroidvania' },
          { label: 'Um SHMUP impossível', value: 'shmup' },
          { label: 'Um point-and-click absurdo', value: 'pointclick' },
          { label: 'Um simulador de fazenda zen', value: 'cozy' },
        ],
      },
    ],
  },
  {
    title: 'Planeta em equilíbrio: hábitos sustentáveis (sem sermão)',
    description:
      '<p>Pequenas escolhas, grandes efeitos — quiz leve sobre rotina e consumo.</p>',
    questions: [
      {
        title: 'No supermercado, você prioriza…',
        description: '',
        options: [
          { label: 'Produtos locais e da estação', value: 'local' },
          { label: 'Embalagens mínimas', value: 'packaging' },
          { label: 'Marcas com transparência', value: 'transparency' },
          { label: 'O que couber na bike', value: 'bike' },
        ],
      },
      {
        title: 'Transporte no dia a dia…',
        description: '',
        options: [
          { label: 'A pé sempre que dá', value: 'walk' },
          { label: 'Bike ou patinete', value: 'bike' },
          { label: 'Transporte público', value: 'public' },
          { label: 'Carro compartilhado quando necessário', value: 'shared' },
        ],
      },
      {
        title: 'Energia em casa: o que você já faz?',
        description: '',
        options: [
          { label: 'Lâmpadas eficientes', value: 'bulbs' },
          { label: 'Desligar aparelhos em standby', value: 'standby' },
          { label: 'Ventilar antes de ligar AC', value: 'ventilate' },
          { label: 'Energia solar onde der', value: 'solar' },
        ],
      },
      {
        title: 'Se pudesse plantar uma árvore amanhã…',
        description: '',
        options: [
          { label: 'Ipê amarelo (clássico)', value: 'ipe' },
          { label: 'Araucária (altura nobre)', value: 'araucaria' },
          { label: 'Mangue (beira d’água)', value: 'mangrove' },
          { label: 'Frutífera para a vizinhança', value: 'fruit' },
        ],
      },
    ],
  },
  {
    title: 'Entre páginas: qual universo literário você habita?',
    description:
      '<p>Fantasia, ficção científica e mistério — sem spoilers, só vibe.</p>',
    questions: [
      {
        title: 'Um cenário que te puxa na hora…',
        description: '',
        options: [
          { label: 'Cidade flutuante steampunk', value: 'steampunk' },
          { label: 'Biblioteca infinita', value: 'library' },
          { label: 'Floresta com mapa incompleto', value: 'forest' },
          { label: 'Estação orbital isolada', value: 'space' },
        ],
      },
      {
        title: 'Seu narrador ideal…',
        description: '',
        options: [
          { label: 'Irônico e observador', value: 'ironic' },
          { label: 'Poético e denso', value: 'poetic' },
          { label: 'Direto e cinematográfico', value: 'cinematic' },
          { label: 'Multivoz e experimental', value: 'experimental' },
        ],
      },
      {
        title: 'Final de história: você prefere…',
        description: '',
        options: [
          { label: 'Revelação que recontextualiza tudo', value: 'twist' },
          { label: 'Aberto, com espaço para sonhar', value: 'open' },
          { label: 'Redenção dolorida', value: 'redemption' },
          { label: 'Vitória pequena, mas real', value: 'small_win' },
        ],
      },
      {
        title: 'Na estante dos sonhos, não pode faltar…',
        description: '',
        options: [
          { label: 'Um tomo de mitologia comparada', value: 'myth' },
          { label: 'Antologia de contos estranhos', value: 'weird' },
          { label: 'Manual de botânica ilustrado', value: 'botany' },
          { label: 'Diário de expedição perdido', value: 'diary' },
        ],
      },
    ],
  },
];

function buildLinearTree(bp: QuizBlueprint): {
  rootNodeId: string;
  nodeIds: string[];
  optionIdsPerNode: string[][];
  nodes: TreeNodePayload[];
} {
  const nodeIds = bp.questions.map(() => randomUUID());
  const optionIdsPerNode: string[][] = [];

  const nodes: TreeNodePayload[] = bp.questions.map((q, qi) => {
    const nextId =
      qi < bp.questions.length - 1 ? nodeIds[qi + 1]! : null;
    const optionIds: string[] = [];
    const answerOptions = q.options.map((o, oi) => {
      const id = randomUUID();
      optionIds.push(id);
      return {
        id,
        label: o.label,
        value: o.value,
        order: oi,
        nextQuestionNodeId: nextId,
      };
    });
    optionIdsPerNode.push(optionIds);
    return {
      id: nodeIds[qi]!,
      title: q.title,
      description: q.description,
      questionType: 'multiple_choice',
      positionX: 0,
      positionY: qi * 100,
      answerOptions,
    };
  });

  return {
    rootNodeId: nodeIds[0]!,
    nodeIds,
    optionIdsPerNode,
    nodes,
  };
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function login(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: USER_EMAIL, password: USER_PASSWORD }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Login falhou (${res.status}): ${t}`);
  }
  const data = (await res.json()) as { accessToken: string };
  return data.accessToken;
}

async function apiJson<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${init?.method ?? 'GET'} ${path} (${res.status}): ${t}`);
  }
  if (res.status === 204) return undefined as T;
  const raw = await res.text();
  if (!raw.trim()) return undefined as T;
  return JSON.parse(raw) as T;
}

async function createQuizViaApi(
  token: string,
  bp: QuizBlueprint,
  tree: ReturnType<typeof buildLinearTree>,
): Promise<string> {
  const created = await apiJson<{ id: string }>(token, '/quizzes', {
    method: 'POST',
    body: JSON.stringify({
      title: bp.title,
      description: bp.description,
      collectName: false,
      collectEmail: false,
      collectPhone: false,
    }),
  });
  const quizId = created.id;
  await apiJson(token, `/quizzes/${quizId}/tree`, {
    method: 'PUT',
    body: JSON.stringify({
      rootNodeId: tree.rootNodeId,
      nodes: tree.nodes,
    }),
  });
  await apiJson(token, `/quizzes/${quizId}`, {
    method: 'PUT',
    body: JSON.stringify({ isPublished: true }),
  });
  return quizId;
}

async function seedSessionsForQuiz(
  prisma: PrismaClient,
  quizId: string,
  nodeIds: string[],
  optionIdsPerNode: string[][],
  optionValuesPerNode: string[][],
  count: number,
  rand: () => number,
) {
  const pathJson = JSON.stringify(nodeIds);

  const runChunk = async (offset: number, size: number) => {
    const tasks: Array<Promise<unknown>> = [];
    for (let i = 0; i < size; i++) {
      const sessionIndex = offset + i;
      const startedAt = new Date(
        Date.now() - Math.floor(rand() * 45 * 24 * 60 * 60 * 1000),
      );
      tasks.push(
        prisma.quizSession
          .create({
            data: {
              quizId,
              status: 'completed',
              pathTaken: pathJson,
              completedAt: new Date(
                startedAt.getTime() + Math.floor(rand() * 15 * 60 * 1000),
              ),
              startedAt,
              answers: {
                create: nodeIds.map((nodeId, qi) => {
                  const opts = optionIdsPerNode[qi]!;
                  const vals = optionValuesPerNode[qi]!;
                  const pick = Math.floor(rand() * opts.length);
                  const answerOptionId = opts[pick]!;
                  const answerValue = vals[pick]!;
                  return {
                    questionNodeId: nodeId,
                    answerOptionId,
                    answerValue,
                  };
                }),
              },
            },
          })
          .then(() => undefined),
      );
    }
    await Promise.all(tasks);
  };

  let done = 0;
  while (done < count) {
    const size = Math.min(PRISMA_BATCH, count - done);
    await runChunk(done, size);
    done += size;
    process.stdout.write(
      `\r  … sessões ${done}/${count} no quiz ${quizId.slice(0, 8)}…`,
    );
  }
  process.stdout.write('\n');
}

async function main() {
  if (!DATABASE_URL) {
    throw new Error('Defina DATABASE_URL para inserir sessões e respostas em massa.');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg(DATABASE_URL),
  });

  const token = await login();
  console.log(`Autenticado como ${USER_EMAIL}.`);
  console.log(
    `Criando ${QUIZ_BLUEPRINTS.length} quizzes e ${SESSIONS_PER_QUIZ} sessões completas por quiz…`,
  );

  const rand = mulberry32(Date.now() % 1_000_000_001);
  const created: Array<{ id: string; title: string }> = [];

  try {
    for (const bp of QUIZ_BLUEPRINTS) {
      const tree = buildLinearTree(bp);
      const quizId = await createQuizViaApi(token, bp, tree);
      created.push({ id: quizId, title: bp.title });
      console.log(`Quiz publicado: "${bp.title}" (${quizId})`);

      const optionValuesPerNode = bp.questions.map((q) =>
        q.options.map((o) => o.value),
      );

      await seedSessionsForQuiz(
        prisma,
        quizId,
        tree.nodeIds,
        tree.optionIdsPerNode,
        optionValuesPerNode,
        SESSIONS_PER_QUIZ,
        rand,
      );
    }

    console.log('Concluído. Resumo:');
    for (const row of created) {
      const sessions = await prisma.quizSession.count({
        where: { quizId: row.id },
      });
      const answers = await prisma.sessionAnswer.count({
        where: { session: { quizId: row.id } },
      });
      console.log(
        `  - ${row.title.slice(0, 52)}${row.title.length > 52 ? '…' : ''} → sessões: ${sessions}, linhas de resposta: ${answers}`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
