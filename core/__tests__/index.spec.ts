import { extractBearerToken, ensureBasicOptions } from "../src";

describe('extractBearerToken', () => {
    test('bearer testtoken', () => {
        const token = extractBearerToken('bearer testtoken');
        expect(token).toEqual('testtoken');
    });
    test('Bearer testtoken', () => {
        const token = extractBearerToken('Bearer testtoken');
        expect(token).toEqual('testtoken');
    });
    test('bearertesttoken', () => {
        const token = extractBearerToken('bearertesttoken');
        expect(token).toBeNull();
    });
    test('testtoken', () => {
        const token = extractBearerToken('testtoken');
        expect(token).toBeNull();
    });
    test('empty string', () => {
        const token = extractBearerToken('');
        expect(token).toBeNull();
    });
    test('empty input', () => {
        // @ts-ignore
        const token = extractBearerToken();
        expect(token).toBeNull();
    });
});

describe('ensureBasicOptions', () => {
    test('empty options', () => {
        const options = ensureBasicOptions();
        expect(typeof options).toEqual('object');
    });
    test('good strategy(bearer)', () => {
        const options = ensureBasicOptions({ strategy: 'bearer' });
        expect(options.strategy).toEqual('bearer');
    });
    test('bad strategy should throw', () => {
        // @ts-ignore
        const func = () => ensureBasicOptions({ strategy: 'bad' });
        expect(func).toThrowError();
    });
});
