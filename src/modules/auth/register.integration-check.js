import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';

if (env.db.name !== 'authentication_api_test') {
	throw new Error('Integration test requires authentication_api_test');
}

const { pool } = await import('../../database/pool.js');
const { registerUser } = await import('./services/register.service.js');
const { verifyPassword } = await import('./services/password.service.js');

const password = 'ExemploDeSenha123!';
const email = `test-${randomUUID()}@example.com`;

let user;

try {
	user = await registerUser({
		name: 'Igor Orlando',
		email,
		phone: '+393331234567',
		password,
	});

	assert.equal(user.name, 'Igor Orlando');
	assert.equal(user.email, email);
	assert.equal(user.phone_verified_at, null);
	assert.equal('password_hash' in user, false);

	const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [user.id]);

	assert.equal(result.rows.length, 1);
	assert.equal(await verifyPassword(result.rows[0].password_hash, password), true);

	console.log('Registration integration test passed');
} catch (error) {
	console.error('Registration integration test failed:', error.message);
	process.exitCode = 1;
} finally {
	if (user) {
		await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
	}

	await pool.end();
}
