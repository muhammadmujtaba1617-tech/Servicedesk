const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeUsers } = require('../src/services/userService');

test('normalizeUsers strips passwords and keeps role-specific data', () => {
  const users = [
    { _id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'admin', password: 'secret' },
    { _id: 'u2', name: 'Bob', email: 'bob@example.com', role: 'agent', password: 'secret' },
  ];

  const result = normalizeUsers(users);

  assert.equal(result.length, 2);
  assert.equal(result[0].password, undefined);
  assert.equal(result[1].role, 'agent');
});
