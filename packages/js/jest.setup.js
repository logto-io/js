// Need to disable following rules to mock text-decode/text-encoder and crypto for jsdom
// https://github.com/jsdom/jsdom/issues/1612
/* eslint-disable unicorn/prefer-module */
const crypto = require('crypto');

const { TextDecoder, TextEncoder } = require('text-encoder');
/* eslint-enable unicorn/prefer-module */

/* eslint-disable @silverhand/fp/no-mutation */
// Mock WebCrypto in JSDOM
if (global.window !== undefined) {
  global.CryptoKey = crypto.webcrypto.CryptoKey;
  global.crypto.subtle = crypto.webcrypto.subtle;
}

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
/* eslint-enable @silverhand/fp/no-mutation */
