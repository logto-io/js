// Need to disable following rulus to mock text-decode/text-encoder and crypto for jsdom
// https://github.com/jsdom/jsdom/issues/1612
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable unicorn/prefer-module */
const { Crypto } = require('@peculiar/webcrypto');
const fetch = require('node-fetch');
const { TextDecoder, TextEncoder } = require('text-encoder');

global.crypto = new Crypto();
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.fetch = fetch;
