/* eslint-disable node/prefer-global/text-decoder */
/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable node/prefer-global/text-encoder */
/* eslint-disable unicorn/prefer-module */
const { TextEncoder, TextDecoder } = require('util');

const { Crypto } = require('@peculiar/webcrypto');
const axios = require('axios');

global.crypto = new Crypto();
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

axios.defaults.adapter = require('axios/lib/adapters/http');
