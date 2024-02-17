// https://github.com/jsdom/jsdom/issues/1612
// We need a WebCrypto polyfill since Node has no direct access to the `CryptoKey` class, which is
// required in `jose`.
import { CryptoKey, Crypto } from '@peculiar/webcrypto';
import { TextDecoder, TextEncoder } from 'text-encoder';

/* eslint-disable @silverhand/fp/no-mutation */
// Mock WebCrypto in JSDOM
if (global.window !== undefined) {
  // Global.CryptoKey = crypto.webcrypto.CryptoKey;
  global.CryptoKey = CryptoKey;
  global.crypto.subtle = new Crypto().subtle;
}

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
/* eslint-enable @silverhand/fp/no-mutation */
