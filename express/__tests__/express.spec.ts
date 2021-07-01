import express, { Express, Response } from 'express';
import request from 'supertest';
import logto, { LogtoEnhancedRequest } from '../src';

describe('go through', () => {
    let app: Express;
    beforeAll(() => {
        app = express();
        app.use(logto({
            unauthorizedHandler: (res) => res.status(401).end(),
        }));
        app.get('/', (req: LogtoEnhancedRequest, res: Response) => {
            res.send('hello ' + req.user.id);
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
