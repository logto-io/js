import { extractBearerToken } from "../src";

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
