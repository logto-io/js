import { TokenSetParameters } from './grant-token';
import { decodeToken, IDToken, now } from './utils';

export default class TokenSet {
  public accessToken: string;
  public idToken: string;
  public refreshToken: string;
  public expiresAt = 0;
  constructor(tokenSet: TokenSetParameters) {
    this.accessToken = tokenSet.access_token;
    this.expiresIn = tokenSet.expires_in;
    this.idToken = tokenSet.id_token;
    this.refreshToken = tokenSet.refresh_token;
  }

  get expiresIn(): number {
    return Math.max(this.expiresAt - now(), 0);
  }

  set expiresIn(value: number) {
    this.expiresAt = now() + value;
  }

  public expired(): boolean {
    return this.expiresIn === 0;
  }

  public claims(): IDToken {
    if (!this.idToken) {
      throw new TypeError('id_token not present in TokenSet');
    }

    return decodeToken(this.idToken);
  }
}
