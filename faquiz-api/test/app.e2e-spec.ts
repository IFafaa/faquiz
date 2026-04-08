import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';
import { DomainExceptionFilter } from '../src/presentation/filters/domain-exception.filter.js';

const run = process.env.E2E_INTEGRATION === 'true';
const describeE2e = run ? describe : describe.skip;

const sampleUuid = '00000000-0000-0000-0000-000000000001';

describeE2e('FAQuiz API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('public routes', () => {
    it('GET /api/quizzes/published → 200', () => {
      return request(app.getHttpServer()).get('/api/quizzes/published').expect(200);
    });

    it('POST /api/auth/login → 401 with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nope@x.com', password: 'wrong' })
        .expect(401);
    });

    it('GET /api/quizzes/:id/public → 404 when quiz does not exist', () => {
      return request(app.getHttpServer())
        .get(`/api/quizzes/${sampleUuid}/public`)
        .expect(404);
    });

    it('POST /api/quizzes/:id/sessions → 404 when quiz does not exist', () => {
      return request(app.getHttpServer())
        .post(`/api/quizzes/${sampleUuid}/sessions`)
        .send({})
        .expect(404);
    });

    it('POST /api/sessions/:id/answers → 404 when session does not exist', () => {
      return request(app.getHttpServer())
        .post(`/api/sessions/${sampleUuid}/answers`)
        .send({})
        .expect(404);
    });

    it('POST /api/sessions/:id/back → 404 when session does not exist', () => {
      return request(app.getHttpServer())
        .post(`/api/sessions/${sampleUuid}/back`)
        .expect(404);
    });
  });

  describe('protected routes (JWT)', () => {
    const authHeader = { Authorization: 'Bearer invalid' };

    it('POST /api/quizzes → 401 without token', () => {
      return request(app.getHttpServer())
        .post('/api/quizzes')
        .send({ title: 'T', description: '' })
        .expect(401);
    });

    it('GET /api/quizzes → 401 without token', () => {
      return request(app.getHttpServer()).get('/api/quizzes').expect(401);
    });

    it('GET /api/quizzes → 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/quizzes')
        .set(authHeader)
        .expect(401);
    });

    it('GET /api/quizzes/:id → 401 without token', () => {
      return request(app.getHttpServer())
        .get(`/api/quizzes/${sampleUuid}`)
        .expect(401);
    });

    it('PUT /api/quizzes/:id → 401 without token', () => {
      return request(app.getHttpServer())
        .put(`/api/quizzes/${sampleUuid}`)
        .send({ title: 'X' })
        .expect(401);
    });

    it('DELETE /api/quizzes/:id → 401 without token', () => {
      return request(app.getHttpServer())
        .delete(`/api/quizzes/${sampleUuid}`)
        .expect(401);
    });

    it('GET /api/quizzes/:id/tree → 401 without token', () => {
      return request(app.getHttpServer())
        .get(`/api/quizzes/${sampleUuid}/tree`)
        .expect(401);
    });

    it('PUT /api/quizzes/:id/tree → 401 without token', () => {
      return request(app.getHttpServer())
        .put(`/api/quizzes/${sampleUuid}/tree`)
        .send({ nodes: [] })
        .expect(401);
    });

    it('GET /api/quizzes/:id/share → 401 without token', () => {
      return request(app.getHttpServer())
        .get(`/api/quizzes/${sampleUuid}/share`)
        .expect(401);
    });

    it('GET /api/quizzes/:id/analytics → 401 without token', () => {
      return request(app.getHttpServer())
        .get(`/api/quizzes/${sampleUuid}/analytics`)
        .expect(401);
    });

    it('GET /api/quizzes/:id/sessions → 401 without token', () => {
      return request(app.getHttpServer())
        .get(`/api/quizzes/${sampleUuid}/sessions`)
        .expect(401);
    });

    it('POST /api/quizzes/:id/analytics/aggregates → 401 without token', () => {
      return request(app.getHttpServer())
        .post(`/api/quizzes/${sampleUuid}/analytics/aggregates`)
        .send({})
        .expect(401);
    });

    it('POST /api/quizzes/:id/export/responses → 401 without token', () => {
      return request(app.getHttpServer())
        .post(`/api/quizzes/${sampleUuid}/export/responses`)
        .send({})
        .expect(401);
    });

    it('GET /api/sessions/:id → 401 without token', () => {
      return request(app.getHttpServer())
        .get(`/api/sessions/${sampleUuid}`)
        .expect(401);
    });
  });

  const seedUserEmail =
    process.env.E2E_USER_EMAIL ??
    process.env.E2E_ADMIN_EMAIL ??
    process.env.FAQUIZ_USER_EMAIL ??
    process.env.ADMIN_EMAIL;
  const seedUserPassword =
    process.env.E2E_USER_PASSWORD ??
    process.env.E2E_ADMIN_PASSWORD ??
    process.env.FAQUIZ_USER_PASSWORD ??
    process.env.ADMIN_PASSWORD;

  const describeWithSeed =
    seedUserEmail && seedUserPassword ? describe : describe.skip;

  describeWithSeed('authenticated flow (requires seed user in database)', () => {
    let token: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: seedUserEmail, password: seedUserPassword });
      expect(res.status).toBe(200);
      expect(res.body?.accessToken).toBeDefined();
      token = res.body.accessToken as string;
    });

    it('GET /api/quizzes → 200 with token', () => {
      return request(app.getHttpServer())
        .get('/api/quizzes')
        .set({ Authorization: `Bearer ${token}` })
        .expect(200);
    });

    it('GET /api/quizzes/:id → 404 with non-existent UUID', () => {
      return request(app.getHttpServer())
        .get(`/api/quizzes/${sampleUuid}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(404);
    });
  });
});
