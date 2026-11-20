import test from 'node:test';
import assert from 'node:assert';
import app from '../src/index.js';

test('backend server exports Express app instance', () => {
  assert.ok(app);
  assert.strictEqual(typeof app, 'function');
});
