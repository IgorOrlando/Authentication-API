import 'dotenv/config';

const portValue = process.env.PORT ?? '3000';
const nodeEnv = process.env.NODE_ENV ?? 'development';

if (portValue.trim() === '') {
	throw new Error('PORT must not be empty');
}

const port = Number(portValue);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
	throw new Error('PORT must be a valid TCP port');
}

const allowedNodeEnvs = ['development', 'test', 'production'];

if (!allowedNodeEnvs.includes(nodeEnv)) {
	throw new Error('NODE_ENV must be development, test or production');
}

const dbHost = process.env.DB_HOST;
const dbPortValue = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const phoneCodeSecret = process.env.PHONE_CODE_SECRET;

if (!dbHost?.trim() || !dbPortValue?.trim() || !dbName?.trim() || !dbUser?.trim() || !dbPassword) {
	throw new Error('Database configuration is incomplete');
}

const dbPort = Number(dbPortValue);

if (!Number.isInteger(dbPort) || dbPort <= 0 || dbPort > 65535) {
	throw new Error('DB_Port must be a valid TCP port');
}

if (!/^[a-fA-F0-9]{64}$/.test(phoneCodeSecret ?? '')) {
	throw new Error('PHONE_CODE_SECRET must be a 32-byte hexadecimal key');
}

export const env = {
	port,
	nodeEnv,
	phoneCodeSecret,
	db: {
		host: dbHost,
		port: dbPort,
		name: dbName,
		user: dbUser,
		password: dbPassword,
	},
};
