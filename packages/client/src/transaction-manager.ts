import { ClientStorage } from './storage';

const TRANSACTION_MANAGER_KEY = 'TRANSACTION_MANAGER';

interface Transaction {
  codeVerifier: string;
  redirectUri: string;
}

export default class TransactionManager {
  private transaction?: Transaction;

  constructor(private readonly storage: ClientStorage) {
    this.transaction = this.storage.getItem(TRANSACTION_MANAGER_KEY);
  }

  public create(transaction: Transaction) {
    this.transaction = transaction;

    this.storage.setItem(TRANSACTION_MANAGER_KEY, transaction, { secondsUntilExpire: 86_400 });
  }

  public get(): Transaction | undefined {
    return this.transaction;
  }

  public remove() {
    this.transaction = undefined;
    this.storage.removeItem(TRANSACTION_MANAGER_KEY);
  }
}
