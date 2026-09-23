CREATE TABLE phone_verification_challenges (
	id UUID PRIMARY KEY,
	user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	code_hash TEXT NOT NULL,
	expires_at TIMESTAMPTZ NOT NULL,
	consumed_at TIMESTAMPTZ,
	attempts INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT phone_verification_code_hash_not_blank
		CHECK (LENGTH(TRIM(code_hash)) > 0),

	CONSTRAINT phone_verification_attempts_non_negative
		CHECK (attempts >= 0),

	CONSTRAINT phone_verification_expiration_valid
		CHECK (expires_at > created_at)
);

CREATE INDEX idx_phone_verification_challenges_user_id
	ON phone_verification_challenges(user_id);