import { TokenResponse } from '../api';
import { nowRoundToSec } from '../utils';
import { decodeIdToken, IdTokenClaims } from '../utils/id-token';

export default class TokenSet {
  public accessToken: string;
  public idToken: string;
  public refreshToken: string;
  public expiresAt = 0;
  constructor(tokenSet: TokenResponse) {
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

  public claims(): IdTokenClaims {
    if (!this.idToken) {
      throw new TypeError('id_token not present in TokenSet');
    }

    return decodeIdToken(this.idToken);
  }
}
