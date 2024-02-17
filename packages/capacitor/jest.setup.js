// https://github.com/jsdom/jsdom/issues/1612

import crypto from 'node:crypto';

import { TextDecoder, TextEncoder } from 'text-encoder';

/* eslint-disable @silverhand/fp/no-mutation */
// Mock WebCrypto in JSDOM
if (global.window !== undefined) {
  global.crypto.subtle = crypto.webcrypto.subtle;
}

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
/* eslint-enable @silverhand/fp/no-mutation */
