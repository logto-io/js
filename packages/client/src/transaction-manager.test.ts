import { SessionStorage } from './storage';
import TransactionManager from './transaction-manager';

const TRANSACTION_MANAGER_KEY = 'TRANSACTION_MANAGER';

const transaction = {
  codeVerifier: 'codeVerifier',
  redirectUri: 'redirectUri',
};

describe('TransactionManager', () => {
  test('constructor', () => {
    const st = new SessionStorage();
    jest.spyOn(st, 'getItem');
    void new TransactionManager(st);
    expect(st.getItem).toHaveBeenCalledWith(TRANSACTION_MANAGER_KEY);
  });

  test('create and get', () => {
    const st = new SessionStorage();
    const tm = new TransactionManager(st);
    tm.create(transaction);
    expect(tm.get()).toMatchObject(transaction);
  });

  test('`create` should save data in storage', () => {
    const st = new SessionStorage();
    const tm = new TransactionManager(st);
    tm.create(transaction);
    expect(st.getItem(TRANSACTION_MANAGER_KEY)).toMatchObject(transaction);
  });

  test('restore data from storage', () => {
    const st = new SessionStorage();
    st.setItem(TRANSACTION_MANAGER_KEY, transaction);
    const tm = new TransactionManager(st);
    expect(tm.get()).toMatchObject(transaction);
  });
});
