CREATE TABLE users (
	id UUID PRIMARY KEY,
	name VARCHAR(120) NOT NULL,
	email VARCHAR(254) NOT NULL UNIQUE,
	phone VARCHAR(16) NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	phone_verified_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT users_name_not_blank CHECK (LENGTH(TRIM(name)) > 0),
	CONSTRAINT users_email_not_blank CHECK (LENGTH(TRIM(email)) > 0),
	CONSTRAINT users_phone_not_blank CHECK (LENGTH(TRIM(phone)) > 0),
	CONSTRAINT users_password_hash_not_blank CHECK (LENGTH(password_hash) > 0)
);