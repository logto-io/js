import Koa, { Context } from 'koa';
import request from 'supertest';
import logto from '../src';

describe('go through', () => {
    let app: Koa;
    beforeAll(() => {
        app = new Koa();
        app.use(logto());
        app.use((ctx: Context) => {
            ctx.body = 'hello ' + ctx.user.id;
        });
    })
    test('find user', (done) => {
        request.agent(app.callback()).get('/').set('authorization', 'bearer test-user-token').expect('hello test-user', done);
    });
    test('empty token should get 401', (done) => {
        request.agent(app.callback()).get('/').expect(401, done);
    });
    test('invalid token should get 401', (done) => {
        request.agent(app.callback()).get('/').set('authorization', 'bearer test-user-token1').expect(401, done);
    });
});
