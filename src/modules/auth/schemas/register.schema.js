import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const registerSchema = z.strictObject({
	name: z.string().trim().min(1).max(120),
	email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
	phone: z
		.string()
		.trim()
		.transform((value, context) => {
			const parsed = parsePhoneNumberFromString(value);

			if (!parsed?.isValid()) {
				context.addIssue({
					code: 'custom',
					message: 'Invalid phone number',
				});

				return z.NEVER;
			}

			return parsed.number;
		}),
	password: z.string().min(12).max(128),
});
