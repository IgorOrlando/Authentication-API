import assert from 'node:assert/strict';
import test from 'node:test';
import { registerSchema } from './schemas/register.schema.js';

const validUser = {
	name: 'Igor Orlando',
	email: 'IGOR@EXAMPLE.COM',
	phone: '+393331234567',
	password: 'Exemplo12345!',
};

function assertInvalidField(data, field) {
	const result = registerSchema.safeParse(data);

	assert.equal(result.success, false);
	assert.ok(result.error.issues.some((issue) => issue.path.includes(field)));
}

test('accepts valid registration data and normalizes the email', () => {
	const result = registerSchema.safeParse(validUser);

	assert.equal(result.success, true);
	assert.equal(result.data.email, 'igor@example.com');
});

test('rejects a blank name', () => {
	assertInvalidField({ ...validUser, name: '   ' }, 'name');
});

test('rejects an invalid email', () => {
	assertInvalidField({ ...validUser, email: 'email-invalido' }, 'email');
});

test('rejects a phone outside the required format', () => {
	assertInvalidField({ ...validUser, phone: '3331234567' }, 'phone');
});

test('rejects a short password', () => {
	assertInvalidField({ ...validUser, password: '123456' }, 'password');
});

test('rejects unexpected fields', () => {
	const result = registerSchema.safeParse({
		...validUser,
		phone_verified_at: new Date(),
	});

	assert.equal(result.success, false);
	assert.ok(result.error.issues.some((issue) => issue.code === 'unrecognized_keys'));
});

test('normalizes a formatted international phone number', () => {
	const result = registerSchema.safeParse({
		...validUser,
		phone: '+39 333 123 4567',
	});

	assert.equal(result.success, true);
	assert.equal(result.data.phone, '+393331234567');
});

test('rejects an invalid international phone number', () => {
	assertInvalidField({ ...validUser, phone: '+391234' }, 'phone');
});

test('rejects a phone number without country code', () => {
	assertInvalidField({ ...validUser, phone: '3331234567' }, 'phone');
});
