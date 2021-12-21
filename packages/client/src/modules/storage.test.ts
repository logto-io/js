// Since we have only one localStorage, all tests should share it
// fp rules are disabled for shared instance initialization in beforeAll
import { LocalStorage, MemoryStorage, SessionStorage } from './storage';

describe('LocalStorage', () => {
  /* eslint-disable-next-line @silverhand/fp/no-let */
  let s: LocalStorage;

  beforeAll(() => {
    /* eslint-disable-next-line @silverhand/fp/no-mutation */
    s = new LocalStorage();
    s.setItem('foo', { value: 'foz' });
    s.setItem('string', 'foz');
    s.setItem('expired', { value: 'foz' }, { millisecondsUntilExpire: 0 });
    s.setItem('to-be-remove', { value: 'foz' });
  });

  test('saves object', () => {
    expect(s.getItem('foo')).toMatchObject({ value: 'foz' });
  });

  test('saves string', () => {
    expect(s.getItem('string')).toEqual('foz');
  });

  test('returns undefined when there is no object', () => {
    expect(s.getItem('invalid-key')).toBeUndefined();
  });

  test('returns undefined when expired', () => {
    expect(s.getItem('expired')).toBeUndefined();
  });
});

describe('SessionStorage', () => {
  /* eslint-disable-next-line @silverhand/fp/no-let */
  let s: SessionStorage;

  beforeAll(() => {
    /* eslint-disable-next-line @silverhand/fp/no-mutation */
    s = new SessionStorage();
    s.setItem('foo', { value: 'foz' });
    s.setItem('string', 'foz');
    s.setItem('expired', { value: 'foz' }, { millisecondsUntilExpire: 0 });
    s.setItem('to-be-remove', { value: 'foz' });
  });

  test('saves object', () => {
    expect(s.getItem('foo')).toMatchObject({ value: 'foz' });
  });

  test('saves string', () => {
    expect(s.getItem('string')).toEqual('foz');
  });

  test('returns undefined when there is no object', () => {
    expect(s.getItem('invalid-key')).toBeUndefined();
  });

  test('returns undefined when expired', () => {
    expect(s.getItem('expired')).toBeUndefined();
  });
});

describe('MemoryStorage', () => {
  /* eslint-disable-next-line @silverhand/fp/no-let */
  let storage: MemoryStorage;

  beforeAll(() => {
    /* eslint-disable-next-line @silverhand/fp/no-mutation */
    storage = new MemoryStorage();
    storage.setItem('foo', { value: 'foz' });
    storage.setItem('string', 'foz');
    storage.setItem('expired', { value: 'foz' }, { millisecondsUntilExpire: 0 });
    storage.setItem('to-be-remove', { value: 'foz' });
  });

  test('saves object', () => {
    expect(storage.getItem('foo')).toMatchObject({ value: 'foz' });
  });

  test('saves string', () => {
    expect(storage.getItem('string')).toEqual('foz');
  });

  test('returns undefined when there is no object', () => {
    expect(storage.getItem('invalid-key')).toBeUndefined();
  });

  test('returns undefined when expired', () => {
    expect(storage.getItem('expired')).toBeUndefined();
  });
});
