/** Rotas públicas e área do criador de questionários (autenticado). */
export const paths = {
  home: '/',
  login: '/entrar',
  register: '/cadastro',
  /** Prefixo da área logada */
  painel: '/painel',
  painelQuizzes: '/painel/quizzes',
  painelQuiz: (id: string) => `/painel/quizzes/${id}`,
  painelQuizTab: (id: string, tab: string) => `/painel/quizzes/${id}/${tab}`,
  painelSessao: (sessionId: string) => `/painel/sessoes/${sessionId}`,
} as const

/** Verifica redirect pós-login seguro (somente rotas internas do painel). */
export function isPainelPath(p: string): boolean {
  return p === paths.painel || p.startsWith(`${paths.painel}/`)
}
