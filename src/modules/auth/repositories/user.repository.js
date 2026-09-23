import { pool } from '../../../database/pool.js';

export async function createUser({ id, name, email, phone, passwordHash }) {
	const result = await pool.query(
		`
		INSERT INTO users (id, name, email, phone, password_hash)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, email, phone, phone_verified_at, created_at, updated_at
		`,
		[id, name, email, phone, passwordHash]
	);

	return result.rows[0];
}
