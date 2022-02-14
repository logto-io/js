// Need to disable following rules to mock text-decode/text-encoder and crypto for jsdom
// https://github.com/jsdom/jsdom/issues/1612
/* eslint-disable unicorn/prefer-module */
const { Crypto } = require('@peculiar/webcrypto');
const fetch = require('node-fetch');
const { TextDecoder, TextEncoder } = require('text-encoder');
/* eslint-enable unicorn/prefer-module */

/* eslint-disable @silverhand/fp/no-mutation */
global.crypto = new Crypto();
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.fetch = fetch;
/* eslint-enable @silverhand/fp/no-mutation */
