import axios from 'axios';

export interface JWK {
  kty: string;
  use: string;
  kid: string;
  e: string;
  n: string;
}

export const fetchJwks = async (url: string): Promise<JWK[]> => {
  try {
    const { data } = await axios.get<{ keys: JWK[] }>(url);
    return data.keys;
  } catch (error: unknown) {
    console.error(error);
    throw new Error('Error occurred during jwks fetching');
  }
};
