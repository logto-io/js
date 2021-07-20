import express, { Express, Response } from 'express';
import supertest from 'supertest';
import { logto, requireAuth } from '../src';
import { LogtoRequest } from '../src/types.d';

describe('go through', () => {
  let app: Express;
  beforeAll(() => {
    app = express();
    app.use(
      logto({
        issuerBaseURL: '/',
        clientID: 'TEST_ID',
        secret: 'TEST_SECRET',
        authRequired: true,
      })
    );
    app.get('/', async (request: LogtoRequest, response: Response) => {
      const user = await request.logto.fetchUserInfo();
      response.send(`hello ${user?.id}`);
    });
  });
  test('find user', (done) => {
    void supertest
      .agent(app)
      .get('/')
      .set('authorization', 'bearer test-user-token')
      .expect('hello test-user', done);
  });
  test('empty token should get 401', (done) => {
    void supertest.agent(app).get('/').expect(401, done);
  });
  test('invalid token should get 401', (done) => {
    void supertest
      .agent(app)
      .get('/')
      .set('authorization', 'bearer test-user-token1')
      .expect(401, done);
  });
});

describe('optional auth require', () => {
  let app: Express;
  beforeAll(() => {
    app = express();
    app.use(
      logto({
        issuerBaseURL: '/',
        clientID: 'TEST_ID',
        secret: 'TEST_SECRET',
        authRequired: false,
      })
    );
    app.get('/', requireAuth, async (request: LogtoRequest, response: Response) => {
      const user = await request.logto.fetchUserInfo();
      response.send(`hello ${user?.id}`);
    });
    app.get('/guest', async (request: LogtoRequest, response: Response) => {
      response.send('hello guest');
    });
  });
  test('require auth', (done) => {
    void supertest
      .agent(app)
      .get('/')
      .set('authorization', 'bearer test-user-token')
      .expect('hello test-user', done);
  });
  test('for guest', (done) => {
    void supertest.agent(app).get('/guest').expect('hello guest', done);
  });
});
