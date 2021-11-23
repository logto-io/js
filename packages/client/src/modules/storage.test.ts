// Since we have only one localStorage, all tests should share it
// fp rules are disabled for shared instance initialization in beforeAll
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable @silverhand/fp/no-let */
import { LocalStorage, MemoryStorage, SessionStorage } from './storage';

describe('LocalStorage', () => {
  let s: LocalStorage;

  beforeAll(() => {
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
  let s: SessionStorage;

  beforeAll(() => {
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
  let storage: MemoryStorage;

  beforeAll(() => {
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
