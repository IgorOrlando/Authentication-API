import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, verifyPassword } from './services/password.service.js';

const password = 'Exemploss12345!';

test('generates an Argon2id password hash', async () => {
	const hash = await hashPassword(password);

	assert.ok(hash.startsWith('$argon2id$'));
	assert.notEqual(hash, password);
});

test('verifies the correct password', async () => {
	const hash = await hashPassword(password);

	assert.equal(await verifyPassword(hash, password), true);
});

test('rejects an incorrect password', async () => {
	const hash = await hashPassword(password);

	assert.equal(await verifyPassword(hash, 'SenhaIncorreta123!'), false);
});

test('generates different hashes for the same password', async () => {
	const firstHash = await hashPassword(password);
	const secondHash = await hashPassword(password);

	assert.notEqual(firstHash, secondHash);
	assert.equal(await verifyPassword(firstHash, password), true);
	assert.equal(await verifyPassword(secondHash, password), true);
});
