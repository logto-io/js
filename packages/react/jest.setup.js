// Need to disable following rules to mock text-decode/text-encoder and crypto for jsdom
// https://github.com/jsdom/jsdom/issues/1612
/* eslint-disable unicorn/prefer-module */
const crypto = require('crypto');

const { location } = require('jest-location-mock');
const { TextDecoder, TextEncoder } = require('text-encoder');
/* eslint-enable unicorn/prefer-module */

/* eslint-disable @silverhand/fp/no-mutation */
global.crypto = {
  getRandomValues: (buffer) => crypto.randomFillSync(buffer),
  subtle: crypto.webcrypto.subtle,
};
global.location = location;
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
/* eslint-enable @silverhand/fp/no-mutation */
