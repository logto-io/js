import axios from 'axios';

export interface OpenIdConfiguration {
  authorizationEndpoint: string;
}

interface OIDCDiscoveryResponse {
  authorization_endpoint: string;
}

export const discoverOpenIDConfiguration = async (url: string): Promise<OpenIdConfiguration> => {
  try {
    const { data } = await axios.get<OIDCDiscoveryResponse>(url);
    return {
      authorizationEndpoint: data.authorization_endpoint,
    };
  } catch (error: unknown) {
    console.error(error);

    throw new Error('Error occurred during OIDC discovery.');
  }
};
