const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3333';
const API = `${BASE.replace(/\/$/, '')}/api`;
const USER_EMAIL =
  process.env.FAQUIZ_USER_EMAIL ??
  process.env.ADMIN_EMAIL ??
  'admin@faquiz.com';
const USER_PASSWORD =
  process.env.FAQUIZ_USER_PASSWORD ??
  process.env.ADMIN_PASSWORD ??
  process.env.ADMIN_SEED_PASSWORD ??
  'admin123';

const SEED_QUIZ_ID = 'cafebabe-0000-4000-8000-00000000a001';

async function req(
  method: string,
  path: string,
  opts?: { body?: unknown; token?: string },
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (opts?.token) {
    headers.Authorization = `Bearer ${opts.token}`;
  }
  return fetch(`${API}${path}`, {
    method,
    headers,
    body:
      opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

function ok(status: number, expected: number | number[], label: string) {
  const exp = Array.isArray(expected) ? expected : [expected];
  if (!exp.includes(status)) {
    throw new Error(`${label}: esperado ${exp.join('|')}, recebido ${status}`);
  }
}

async function main() {
  console.log(`Verificação HTTP → ${API}`);

  let r: Response;
  try {
    r = await req('GET', '/quizzes/published');
  } catch (e) {
    const msg =
      e instanceof Error && 'cause' in e && e.cause instanceof Error
        ? `${e.message} (${(e.cause as Error).message})`
        : String(e);
    console.error(
      `Falha de rede (API em execução em ${BASE}?): ${msg}`,
    );
    process.exitCode = 1;
    return;
  }
  ok(r.status, 200, 'GET /quizzes/published');
  const published = (await r.json()) as unknown;
  console.log('  published:', Array.isArray(published) ? `${published.length} itens` : typeof published);

  r = await req('GET', `/quizzes/${SEED_QUIZ_ID}/public`);
  ok(r.status, [200, 404], 'GET /quizzes/:id/public');
  if (r.status === 404) {
    console.warn(
      '  Quiz seed não encontrado (rode prisma seed com ADMIN_SEED_PASSWORD).',
    );
  }

  r = await req('POST', '/auth/login', {
    body: { email: USER_EMAIL, password: USER_PASSWORD },
  });
  ok(r.status, [200, 401], 'POST /auth/login');
  if (r.status !== 200) {
    console.warn(
      '  Login falhou (credenciais ou seed). Demais rotas protegidas serão ignoradas.',
    );
    console.log('Verificação concluída (parcial).');
    return;
  }
  const { accessToken } = (await r.json()) as { accessToken: string };
  const token = accessToken;

  r = await req('GET', '/quizzes', { token });
  ok(r.status, 200, 'GET /quizzes');

  r = await req('GET', `/quizzes/${SEED_QUIZ_ID}`, { token });
  ok(r.status, [200, 404], 'GET /quizzes/:id');

  r = await req('GET', `/quizzes/${SEED_QUIZ_ID}/tree`, { token });
  ok(r.status, [200, 404], 'GET /quizzes/:id/tree');

  r = await req('POST', `/quizzes/${SEED_QUIZ_ID}/analytics/aggregates`, {
    token,
    body: { filters: null },
  });
  ok(r.status, [200, 404], 'POST aggregates');

  r = await req('POST', `/quizzes/${SEED_QUIZ_ID}/export/responses`, {
    token,
    body: { filters: null },
  });
  ok(r.status, [200, 404, 413], 'POST export');

  r = await req('POST', `/quizzes/${SEED_QUIZ_ID}/sessions`, {
    body: {},
  });
  ok(r.status, [200, 400, 404], 'POST start session');
  if (r.status === 200) {
    const start = (await r.json()) as { sessionId?: string };
    const sid = start.sessionId;
    if (sid) {
      r = await req('POST', `/sessions/${sid}/back`);
      ok(r.status, [200, 400], 'POST session back');
    }
  }

  console.log('Verificação OK.');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
