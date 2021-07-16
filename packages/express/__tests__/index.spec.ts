import express, { Express, Response } from 'express';
import request from 'supertest';
import { logto, requireAuth } from '../src';
import { LogtoRequest } from '../src/types';

describe('go through', () => {
    let app: Express;
    beforeAll(() => {
        app = express();
        app.use(logto({
            issuerBaseURL: '/',
            clientID: 'TEST_ID',
            secret: 'TEST_SECRET',
            authRequired: true,
        }));
        app.get('/', async (req: LogtoRequest, res: Response) => {
            const user = await req.logto.fetchUserInfo();
            res.send('hello ' + user?.id);
        });
    })
    test('find user', (done) => {
        request.agent(app).get('/').set('authorization', 'bearer test-user-token').expect('hello test-user', done);
    });
    test('empty token should get 401', (done) => {
        request.agent(app).get('/').expect(401, done);
    });
    test('invalid token should get 401', (done) => {
        request.agent(app).get('/').set('authorization', 'bearer test-user-token1').expect(401, done);
    });
});

describe('optional auth require', () => {
    let app: Express;
    beforeAll(() => {
        app = express();
        app.use(logto({
            issuerBaseURL: '/',
            clientID: 'TEST_ID',
            secret: 'TEST_SECRET',
            authRequired: false,
        }));
        app.get('/', requireAuth, async (req: LogtoRequest, res: Response) => {
            const user = await req.logto.fetchUserInfo();
            res.send('hello ' + user.id);
        });
        app.get('/guest', async (req: LogtoRequest, res: Response) => {
            res.send('hello guest');
        });
    })
    test('require auth', (done) => {
        request.agent(app).get('/').set('authorization', 'bearer test-user-token').expect('hello test-user', done);
    });
    test('for guest', (done) => {
        request.agent(app).get('/guest').expect('hello guest', done);
    });
});
