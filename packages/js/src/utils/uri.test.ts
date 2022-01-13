import { appendSlashIfNeeded } from './index';

describe('appendSlashIfNeeded', () => {
  test('should not append extra slack if url end with slash', () => {
    const URL = 'www.test.com/';
    expect(appendSlashIfNeeded(URL)).toEqual(URL);
  });

  test('should append extra slack if url does not contain slash at the end', () => {
    const URL = 'www.test.com';
    expect(appendSlashIfNeeded(URL)).toEqual(`${URL}/`);
  });
});
