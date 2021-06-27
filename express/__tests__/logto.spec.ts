import logto from "../src";

describe('logto init', () => {
    test('empty options', () => {
        const m = logto();
        expect(typeof m).toEqual('function');
    });
    test('good strategy(bearer)', () => {
        const m = logto({ strategy: 'bearer' });
        expect(typeof m).toEqual('function');
    });
    test('bad strategy should throw', () => {
        // @ts-ignore
        const func = () => logto({ strategy: 'bad' });
        expect(func).toThrowError();
    });
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
