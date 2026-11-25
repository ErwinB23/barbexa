import {
  parseConfiguredAuthLink,
  type AuthLinkConfig,
} from './auth-link-validation';
export function parseAuthLink(raw: string, config: AuthLinkConfig) {
  return parseConfiguredAuthLink(raw, config, 'native');
}
