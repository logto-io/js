const assert = require('node:assert');

const logto = require('.');

// Sanity check for resolving CJS in Node.js
assert.strictEqual(typeof logto.default, 'function');
