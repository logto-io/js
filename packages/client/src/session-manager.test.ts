import SessionManager from './session-manager';
import { SessionStorage } from './storage';

const SESSION_MANAGER_KEY = 'LOGTO_SESSION_MANAGER';

const transaction = {
  codeVerifier: 'codeVerifier',
  redirectUri: 'redirectUri',
};

describe('SessionManager', () => {
  test('create and get', () => {
    const sessionStorage = new SessionStorage();
    const sessionManager = new SessionManager(sessionStorage);
    sessionManager.set(transaction);
    expect(sessionManager.get()).toMatchObject(transaction);
  });

  test('`create` should save data in storage', () => {
    const sessionStorage = new SessionStorage();
    const sessionManager = new SessionManager(sessionStorage);
    sessionManager.set(transaction);
    expect(sessionStorage.getItem(SESSION_MANAGER_KEY)).toMatchObject(transaction);
  });

  test('restore data from storage', () => {
    const sessionStorage = new SessionStorage();
    sessionStorage.setItem(SESSION_MANAGER_KEY, transaction);
    const sessionManager = new SessionManager(sessionStorage);
    expect(sessionManager.get()).toMatchObject(transaction);
  });
});
