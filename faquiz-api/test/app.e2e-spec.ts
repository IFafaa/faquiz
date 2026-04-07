import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

/**
 * Testes de integração reais (Prisma + Postgres).
 * Rode: `E2E_INTEGRATION=true npm run test:e2e`
 * Requisitos: DATABASE_URL válido, migrações aplicadas, seed opcional.
 */
const run = process.env.E2E_INTEGRATION === 'true';
const describeE2e = run ? describe : describe.skip;

describeE2e('FAQuiz API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/quizzes/published → 200', () => {
    return request(app.getHttpServer())
      .get('/api/quizzes/published')
      .expect(200);
  });

  it('POST /api/auth/login → 401 com credenciais inválidas', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nope@x.com', password: 'wrong' })
      .expect(401);
  });
});
