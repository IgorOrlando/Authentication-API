import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';

if (env.db.name !== 'authentication_api_test') {
	throw new Error('Integration test requires authentication_api_test');
}

const { pool } = await import('../../database/pool.js');
const { registerUser } = await import('./services/register.service.js');
const { createPhoneVerification } = await import('./services/phone-verification.service.js');
const { verifyPhoneCode } = await import('./services/phone-code.service.js');

let client;
let user;

try {
	user = await registerUser(pool, {
		name: 'Integration Test',
		email: `test-${randomUUID()}@example.com`,
		phone: '+393331234567',
		password: 'ExemploDeSenha123!',
	});

	client = await pool.connect();
	await client.query('BEGIN');

	const { challenge, code } = await createPhoneVerification(client, user.id);

	assert.equal(challenge.user_id, user.id);
	assert.equal(challenge.attempts, 0);
	assert.equal(challenge.consumed_at, null);
	assert.equal('code_hash' in challenge, false);

	const result = await client.query(
		'SELECT code_hash, expires_at, created_at FROM phone_verification_challenges WHERE id = $1',
		[challenge.id]
	);

	assert.equal(result.rows.length, 1);

	const stored = result.rows[0];

	assert.equal(verifyPhoneCode(challenge.id, code, stored.code_hash), true);
	assert.equal(stored.code_hash === code, false);

	const expirationMinutes = (stored.expires_at - stored.created_at) / 60000;

	assert.ok(expirationMinutes > 9);
	assert.ok(expirationMinutes <= 10);

	console.log('Phone verification integration test passed');
} catch (error) {
	console.error('Phone verification integration test failed:', error.message);
	process.exitCode = 1;
} finally {
	if (client) {
		try {
			await client.query('ROLLBACK');
		} finally {
			client.release();
		}
	}

	if (user) {
		await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
	}

	await pool.end();
}
