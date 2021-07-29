import axios from 'axios';

export interface OpenIdConfiguration {
  authorizationEndpoint: string;
}

interface OIDCDiscoveryResponse {
  authorization_endpoint: string;
  claims_parameter_supported: boolean;
  claims_supported: string[];
  code_challenge_methods_supported: string[];
  end_session_endpoint: string;
  grant_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  issuer: string;
  jwks_uri: string;
  response_modes_supported: string[];
  response_types_supported: string[];
  scopes_supported: string[];
  subject_types_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  token_endpoint_auth_signing_alg_values_supported: string[];
  token_endpoint: string;
  request_object_signing_alg_values_supported: string[];
  request_parameter_supported: boolean;
  request_uri_parameter_supported: boolean;
  require_request_uri_registration: boolean;
  userinfo_endpoint: string;
  introspection_endpoint: string;
  introspection_endpoint_auth_methods_supported: string[];
  introspection_endpoint_auth_signing_alg_values_supported: string[];
  revocation_endpoint: string;
  revocation_endpoint_auth_methods_supported: string[];
  revocation_endpoint_auth_signing_alg_values_supported: string[];
  claim_types_supported: string[];
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
