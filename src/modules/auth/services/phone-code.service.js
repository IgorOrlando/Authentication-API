import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { env } from '../../../config/env.js';

export function generatePhoneCode() {
	return randomInt(0, 1000000).toString().padStart(6, '0');
}

export function hashPhoneCode(challengeId, code) {
	return createHmac('sha256', env.phoneCodeSecret).update(`${challengeId}:${code}`).digest('hex');
}

export function verifyPhoneCode(challengeId, code, storedHash) {
	if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
		return false;
	}

	if (typeof storedHash !== 'string' || !/^[a-f0-9]{64}$/.test(storedHash)) {
		return false;
	}

	const receivedHash = Buffer.from(hashPhoneCode(challengeId, code), 'hex');
	const expectedHash = Buffer.from(storedHash, 'hex');

	return timingSafeEqual(receivedHash, expectedHash);
}
