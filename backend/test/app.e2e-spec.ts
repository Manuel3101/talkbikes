import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  it('/chat (POST) streams chat messages as newline-delimited JSON', async () => {
    const response = await request(app.getHttpServer())
      .post('/chat')
      .send({ question: 'How many bikes are available?' })
      .expect(200);
    const messages = response.text
      .trim()
      .split('\n')
      .map(line => JSON.parse(line) as { id: string; role: string; content: string });

    expect(messages.length).toBeGreaterThan(1);
    expect(messages.at(-1)).toMatchObject({
      role: 'system',
      content: 'I received your question: "How many bikes are available?". The GBFS data lookup is not connected yet.',
    });
    expect(response.headers['content-type']).toContain('application/x-ndjson');
  });

  it('/chat (POST) rejects an empty question', () => {
    return request(app.getHttpServer()).post('/chat').send({ question: ' ' }).expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
