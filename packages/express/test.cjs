const assert = require('node:assert');

const { withLogto } = require('.');

// Sanity check for resolving CJS in Node.js
assert.strictEqual(typeof withLogto, 'function');
