export async function createPhoneVerificationChallenge(
	client,
	{ id, userId, codeHash, expiresAt }
) {
	const result = await client.query(
		`
		INSERT INTO phone_verification_challenges (
			id,
			user_id,
			code_hash,
			expires_at
		)
		VALUES ($1, $2, $3, $4)
		RETURNING id, user_id, expires_at, attempts, consumed_at, created_at
		`,
		[id, userId, codeHash, expiresAt]
	);

	return result.rows[0];
}
