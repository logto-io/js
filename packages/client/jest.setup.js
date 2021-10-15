// Need to disable following rulus to mock text-decode/text-encoder and crypto for jsdom
// https://github.com/jsdom/jsdom/issues/1612
/* eslint-disable node/prefer-global/text-decoder */
/* eslint-disable node/prefer-global/text-encoder */
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable unicorn/prefer-module */
const { TextEncoder, TextDecoder } = require('util');

const { Crypto } = require('@peculiar/webcrypto');
const axios = require('axios');

global.crypto = new Crypto();
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

axios.defaults.adapter = require('axios/lib/adapters/http');
