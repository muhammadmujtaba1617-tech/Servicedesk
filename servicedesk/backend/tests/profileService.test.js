const test = require('node:test');
const assert = require('node:assert/strict');

const { sanitizeUserProfile } = require('../src/services/profileService');

test('sanitizeUserProfile strips password and includes the expected profile fields', () => {
  const profile = sanitizeUserProfile({
    _id: 'u1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'customer',
    password: 'secret',
    avatar: 'avatar.png',
    isActive: true,
  });

  assert.equal(profile.id, 'u1');
  assert.equal(profile.name, 'Jane Doe');
  assert.equal(profile.email, 'jane@example.com');
  assert.equal(profile.role, 'customer');
  assert.equal(profile.password, undefined);
  assert.equal(profile.avatar, 'avatar.png');
  assert.equal(profile.isActive, true);
});
