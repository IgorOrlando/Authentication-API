import { randomUUID } from 'node:crypto';
import { createPhoneVerificationChallenge } from '../repositories/phone-verification.repository.js';
import { generatePhoneCode, hashPhoneCode } from './phone-code.service.js';

const CODE_EXPIRATION_MINUTES = 10;

export async function createPhoneVerification(client, userId) {
	const id = randomUUID();
	const code = generatePhoneCode();
	const codeHash = hashPhoneCode(id, code);
	const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000);

	const challenge = await createPhoneVerificationChallenge(client, {
		id,
		userId,
		codeHash,
		expiresAt,
	});

	return { challenge, code };
}
