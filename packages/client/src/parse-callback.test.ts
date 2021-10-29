import { parseRedirectCallback } from './parse-callback';

describe('parseRedirectCallback', () => {
  test('get result', () => {
    const url =
      'http://localhost:3000/callback?code=random-code&error=error&error_description=some%20description';
    const result = parseRedirectCallback(url);
    expect(result.code).toEqual('random-code');
    expect(result.error).toEqual('error');
    expect(result.error_description).toEqual('some description');
  });

  test('no query params should fail', () => {
    expect(() => parseRedirectCallback('http://localhost:3000')).toThrow();
  });
});
