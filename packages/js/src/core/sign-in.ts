import qs from 'query-string';

import { withDefaultScopeValues } from '../utils/scope';

const prompt = 'consent';
const codeChallengeMethod = 'S256';

export type SignInUriParameters = {
  authorizationEndpoint: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
  scope?: string | string[];
  resource?: string | string[];
};

enum ResponseType {
  code = 'code',
}

const toArray = (stringOrStringArray?: string | string[]): string[] =>
  stringOrStringArray === undefined
    ? []
    : Array.isArray(stringOrStringArray)
    ? stringOrStringArray
    : [stringOrStringArray];

export const generateSignInUri = ({
  authorizationEndpoint,
  clientId,
  redirectUri,
  codeChallenge,
  state,
  scope,
  resource,
}: SignInUriParameters) => {
  const queryStringWithoutResource = qs.stringify({
    client_id: clientId,
    redirect_uri: [redirectUri],
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    state,
    response_type: ResponseType.code,
    prompt,
    scope: withDefaultScopeValues(scope),
  });

  const queryStringWithOnlyResource = toArray(resource).reduce(
    (accumulator, item) => `${accumulator}&resource=${item}`,
    ''
  );

  const queryString = `${queryStringWithoutResource}${queryStringWithOnlyResource}`;

  return `${authorizationEndpoint}?${queryString}`;
};
