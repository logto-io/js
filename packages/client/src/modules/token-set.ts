import { TokenSetParameters } from '../api';
import { nowRoundToSec } from '../utils';
import { decodeToken, IDToken } from '../utils/id-token';

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
    return Math.max(this.expiresAt - nowRoundToSec(), 0);
  }

  set expiresIn(seconds: number) {
    this.expiresAt = nowRoundToSec() + seconds;
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
