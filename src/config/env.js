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

export const env = {
	port,
	nodeEnv,
};
