import { randomUUID } from 'node:crypto';
import { registerSchema } from '../schemas/register.schema.js';
import { createUser } from '../repositories/user.repository.js';
import { hashPassword } from './password.service.js';

export async function registerUser(input) {
	const data = registerSchema.parse(input);

	const id = randomUUID();
	const passwordHash = await hashPassword(data.password);

	return createUser({
		id,
		name: data.name,
		email: data.email,
		phone: data.phone,
		passwordHash,
	});
}
