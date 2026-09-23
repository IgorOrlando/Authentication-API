import assert from 'node:assert/strict';
import test from 'node:test';
import {
	generatePhoneCode,
	hashPhoneCode,
	verifyPhoneCode,
} from './services/phone-code.service.js';

test('generates a six-digit numeric code', () => {
	const code = generatePhoneCode();

	assert.match(code, /^\d{6}$/);
});

test('generates a deterministic hash for the same challenge and code', () => {
	const challengeId = 'challenge-123';
	const code = '012345';

	const firstHash = hashPhoneCode(challengeId, code);
	const secondHash = hashPhoneCode(challengeId, code);

	assert.equal(firstHash, secondHash);
	assert.match(firstHash, /^[a-f0-9]{64}$/);
	assert.notEqual(firstHash, code);
});

test('generates different hashes for different challenges', () => {
	const code = '012345';

	const firstHash = hashPhoneCode('challenge-123', code);
	const secondHash = hashPhoneCode('challenge-456', code);

	assert.notEqual(firstHash, secondHash);
});

test('generates different hashes for different codes', () => {
	const challengeId = 'challenge-123';

	const firstHash = hashPhoneCode(challengeId, '012345');
	const secondHash = hashPhoneCode(challengeId, '012346');

	assert.notEqual(firstHash, secondHash);
});

test('accepts the correct phone verification code', () => {
	const challengeId = 'challenge-123';
	const code = '012345';
	const storedHash = hashPhoneCode(challengeId, code);

	assert.equal(verifyPhoneCode(challengeId, code, storedHash), true);
});

test('rejects an incorrect phone verification code', () => {
	const challengeId = 'challenge-123';
	const storedHash = hashPhoneCode(challengeId, '012345');

	assert.equal(verifyPhoneCode(challengeId, '012346', storedHash), false);
});

test('rejects a code from a different challenge', () => {
	const storedHash = hashPhoneCode('challenge-123', '012345');

	assert.equal(verifyPhoneCode('challenge-456', '012345', storedHash), false);
});

test('rejects malformed codes and hashes', () => {
	const challengeId = 'challenge-123';
	const storedHash = hashPhoneCode(challengeId, '012345');

	assert.equal(verifyPhoneCode(challengeId, '12345', storedHash), false);
	assert.equal(verifyPhoneCode(challengeId, 'abcdef', storedHash), false);
	assert.equal(verifyPhoneCode(challengeId, '012345', 'invalid-hash'), false);
});
