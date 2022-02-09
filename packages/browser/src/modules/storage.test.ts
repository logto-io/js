/**
 * @jest-environment jsdom
 */
import { LogtoMemoryStorage, LogtoSessionStorage } from './storage';

describe('LogtoSessionStorage methods', () => {
  const logtoSessionStorage = new LogtoSessionStorage();

  beforeEach(() => {
    logtoSessionStorage.clear();
  });

  describe('length', () => {
    test('storage should return specific length', () => {
      const key = 'only_one_key';
      const value = 'only_one_value';
      logtoSessionStorage.setItem(key, value);
      expect(logtoSessionStorage.length).toEqual(1);

      logtoSessionStorage.removeItem(key);
      expect(logtoSessionStorage.length).toEqual(0);
    });
  });

  describe('getItem (calling removeItem) and setItem', () => {
    test('getting by invalid key should return undefined', () => {
      const itemValue = logtoSessionStorage.getItem<Record<string, unknown>>('invalid_key');
      expect(itemValue).toBeUndefined();
    });

    test('getting expired item should return undefined', () => {
      const key = 'expired_string_key';
      logtoSessionStorage.setItem(key, 'expired_string_value', {
        expiresIn: 0,
      });
      const itemValue = logtoSessionStorage.getItem(key);
      expect(itemValue).toBeUndefined();
    });

    test('set and get string item', () => {
      const key = 'string_key';
      const value = 'string_value';
      logtoSessionStorage.setItem(key, value);
      const logtoItem = logtoSessionStorage.getItem<string>(key);
      expect(logtoItem).toEqual(value);
    });

    test('set and get number item', () => {
      const key = 'number_key';
      const value = 999;
      logtoSessionStorage.setItem(key, value);
      const itemValue = logtoSessionStorage.getItem<string>(key);
      expect(itemValue).toEqual(value);
    });

    test('set and get boolean item', () => {
      const key = 'boolean_key';
      const value = false;
      logtoSessionStorage.setItem(key, value);
      const itemValue = logtoSessionStorage.getItem<string>(key);
      expect(itemValue).toEqual(value);
    });

    test('set and get object item', () => {
      const key = 'object_key';
      const value = { foo: 'bar' };
      logtoSessionStorage.setItem(key, value);
      const itemValue = logtoSessionStorage.getItem<Record<string, unknown>>(key);
      expect(itemValue).toMatchObject(value);
    });
  });

  describe('clear', () => {
    test('storage should return length 0 after clearing', () => {
      logtoSessionStorage.setItem('one_key', 'one_value');
      expect(logtoSessionStorage.length).toEqual(1);

      logtoSessionStorage.clear();
      expect(logtoSessionStorage.length).toEqual(0);
    });
  });

  describe('key', () => {
    test('storage should return specific key name', () => {
      logtoSessionStorage.setItem('key_0', 'value_0');
      logtoSessionStorage.setItem('key_1', 'value_1');
      expect(logtoSessionStorage.key(0)).toEqual('key_0');
      expect(logtoSessionStorage.key(1)).toEqual('key_1');
    });
  });
});

describe('LogtoMemoryStorage methods', () => {
  const logtoMemoryStorage = new LogtoMemoryStorage();

  beforeEach(() => {
    logtoMemoryStorage.clear();
  });

  describe('length', () => {
    test('storage should return specific length', () => {
      const key = 'only_one_key';
      const value = 'only_one_value';
      logtoMemoryStorage.setItem(key, value);
      expect(logtoMemoryStorage.length).toEqual(1);

      logtoMemoryStorage.removeItem(key);
      expect(logtoMemoryStorage.length).toEqual(0);
    });
  });

  describe('getItem (calling removeItem) and setItem', () => {
    test('getting by invalid key should return undefined', () => {
      const itemValue = logtoMemoryStorage.getItem<Record<string, unknown>>('invalid_key');
      expect(itemValue).toBeUndefined();
    });

    test('getting expired item should return undefined', () => {
      const key = 'expired_string_key';
      logtoMemoryStorage.setItem(key, 'expired_string_value', {
        expiresIn: 0,
      });
      const itemValue = logtoMemoryStorage.getItem(key);
      expect(itemValue).toBeUndefined();
    });

    test('set and get string item', () => {
      const key = 'string_key';
      const value = 'string_value';
      logtoMemoryStorage.setItem(key, value);
      const logtoItem = logtoMemoryStorage.getItem<string>(key);
      expect(logtoItem).toEqual(value);
    });

    test('set and get number item', () => {
      const key = 'number_key';
      const value = 999;
      logtoMemoryStorage.setItem(key, value);
      const itemValue = logtoMemoryStorage.getItem<string>(key);
      expect(itemValue).toEqual(value);
    });

    test('set and get boolean item', () => {
      const key = 'boolean_key';
      const value = false;
      logtoMemoryStorage.setItem(key, value);
      const itemValue = logtoMemoryStorage.getItem<string>(key);
      expect(itemValue).toEqual(value);
    });

    test('set and get object item', () => {
      const key = 'object_key';
      const value = { foo: 'bar' };
      logtoMemoryStorage.setItem(key, value);
      const itemValue = logtoMemoryStorage.getItem<Record<string, unknown>>(key);
      expect(itemValue).toMatchObject(value);
    });
  });

  describe('clear', () => {
    test('storage should return length 0 after clearing', () => {
      logtoMemoryStorage.setItem('one_key', 'one_value');
      expect(logtoMemoryStorage.length).toEqual(1);

      logtoMemoryStorage.clear();
      expect(logtoMemoryStorage.length).toEqual(0);
    });
  });

  describe('key', () => {
    test('empty storage should return undefined key name', () => {
      expect(logtoMemoryStorage.key(0)).toBeUndefined();
    });

    test('storage should return specific key name', () => {
      logtoMemoryStorage.setItem('key_0', 'value_0');
      expect(logtoMemoryStorage.key(0)).toEqual('key_0');
    });

    test('storage should return undefined key name when index is out of range', () => {
      logtoMemoryStorage.setItem('key_0', 'value_0');
      expect(logtoMemoryStorage.key(1)).toBeUndefined();
    });
  });
});
