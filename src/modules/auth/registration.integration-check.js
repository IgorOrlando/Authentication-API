import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';

if (env.db.name !== 'authentication_api_test') {
	throw new Error('Integration test requires authentication_api_test');
}

const { pool } = await import('../../database/pool.js');
const { registerWithPhoneVerification } = await import('./services/registration.service.js');
const { verifyPhoneCode } = await import('./services/phone-code.service.js');

function createTestInput() {
	return {
		name: 'Integration Test',
		email: `test-${randomUUID()}@example.com`,
		phone: '+393331234567',
		password: 'Exemplo12345!',
	};
}

async function testSuccessfulRegistration() {
	const { user, challenge, code } = await registerWithPhoneVerification(createTestInput());

	try {
		const result = await pool.query(
			`
			SELECT code_hash
			FROM phone_verification_challenges
			WHERE id = $1 AND user_id = $2
			`,
			[challenge.id, user.id]
		);

		assert.equal(result.rows.length, 1);
		assert.equal(verifyPhoneCode(challenge.id, code, result.rows[0].code_hash), true);
		assert.equal(user.phone_verified_at, null);
		assert.equal('password_hash' in user, false);
		assert.equal('code_hash' in challenge, false);
	} finally {
		await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
	}
}

async function testRegistrationRollback() {
	const input = createTestInput();

	async function simulateChallengeFailure() {
		throw new Error('Simulated challenge creation failure');
	}

	await assert.rejects(
		registerWithPhoneVerification(input, simulateChallengeFailure),
		/Simulated challenge creation failure/
	);

	const result = await pool.query('SELECT id FROM users WHERE email = $1', [input.email]);

	assert.equal(result.rows.length, 0);
}

try {
	await testSuccessfulRegistration();
	console.log('Registration transaction COMMIT test passed');

	await testRegistrationRollback();
	console.log('Registration transaction ROLLBACK test passed');
} catch (error) {
	console.error('Registration transaction integration test failed:', error.message);
	process.exitCode = 1;
} finally {
	await pool.end();
}
