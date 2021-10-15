/* eslint-disable @silverhand/fp/no-mutation */
/* eslint-disable node/prefer-global/text-encoder */
/* eslint-disable unicorn/prefer-module */
const { TextEncoder } = require('util');

const { Crypto } = require('@peculiar/webcrypto');

global.crypto = new Crypto();
global.TextEncoder = TextEncoder;
