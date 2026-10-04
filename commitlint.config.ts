import conventional from '@commitlint/config-conventional';
import { UserConfig } from '@commitlint/types';

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [...conventional.rules['type-enum'][2], 'release']],
  },
};

export default config;
