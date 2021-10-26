import SessionManager from './session-manager';
import { SessionStorage } from './storage';

const SESSION_MANAGER_KEY = 'SESSION_MANAGER';

const transaction = {
  codeVerifier: 'codeVerifier',
  redirectUri: 'redirectUri',
};

describe('SessionManager', () => {
  test('constructor', () => {
    const st = new SessionStorage();
    jest.spyOn(st, 'getItem');
    void new SessionManager(st);
    expect(st.getItem).toHaveBeenCalledWith(SESSION_MANAGER_KEY);
  });

  test('create and get', () => {
    const st = new SessionStorage();
    const tm = new SessionManager(st);
    tm.create(transaction);
    expect(tm.get()).toMatchObject(transaction);
  });

  test('`create` should save data in storage', () => {
    const st = new SessionStorage();
    const tm = new SessionManager(st);
    tm.create(transaction);
    expect(st.getItem(SESSION_MANAGER_KEY)).toMatchObject(transaction);
  });

  test('restore data from storage', () => {
    const st = new SessionStorage();
    st.setItem(SESSION_MANAGER_KEY, transaction);
    const tm = new SessionManager(st);
    expect(tm.get()).toMatchObject(transaction);
  });
});
