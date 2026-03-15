import { WebStorageStateStore } from 'oidc-client-ts';
import { env } from '../utils/env';

export const oidcConfig = {
  authority: env.authAuthority,
  client_id: env.authClientId,
  redirect_uri: env.authRedirectUri,
  post_logout_redirect_uri: env.authPostLogoutUri,
  response_type: 'code',
  scope: 'openid profile email roles CoreApp',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
};
