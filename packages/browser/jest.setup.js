// Need to disable following rules to mock text-decode/text-encoder and crypto for jsdom
// https://github.com/jsdom/jsdom/issues/1612
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable unicorn/prefer-module */
const { TextDecoder, TextEncoder } = require('text-encoder');

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
