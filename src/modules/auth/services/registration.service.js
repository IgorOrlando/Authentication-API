import { pool } from '../../../database/pool.js';
import { createPhoneVerification } from './phone-verification.service.js';
import { registerUser } from './register.service.js';

export async function registerWithPhoneVerification(
	input,
	createChallenge = createPhoneVerification
) {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		const user = await registerUser(client, input);
		const { challenge, code } = await createChallenge(client, user.id);

		await client.query('COMMIT');

		return { user, challenge, code };
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
}
