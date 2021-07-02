import logto from "../src";

describe('logto init', () => {
    test('good unauthorizedHandler', () => {
        const m = logto({ unauthorizedHandler: () => {} });
        expect(typeof m).toEqual('function');
    });
    test('bad unauthorizedHandler should throw', () => {
        // @ts-ignore
        const func = () => logto({ unauthorizedHandler: 'bad' });
        expect(func).toThrowError();
    });
});
