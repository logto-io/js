import express, { Express, Response } from 'express';
import request from 'supertest';
import { logto } from '../src';
import { LogtoRequest } from '../src/types';

describe('go through', () => {
    let app: Express;
    beforeAll(() => {
        app = express();
        app.use(logto({
            issuerBaseURL: '/',
            clientID: 'TEST_ID',
            secret: 'TEST_SECRET',
        }));
        app.get('/', async (req: LogtoRequest, res: Response) => {
            const user = await req.logto.fetchUserInfo();
            res.send('hello ' + user.id);
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
