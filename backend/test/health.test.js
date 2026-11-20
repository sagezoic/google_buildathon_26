import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';

test('backend server exports Express app instance', () => {
  assert.ok(app);
  assert.strictEqual(typeof app, 'function');
});
