import app from './app.js';
import { env } from './config/env.js';
import { pool } from './database/pool.js';

async function startServer() {
	try {
		await pool.query('SELECT 1');

		console.log('Database connection established');

		app.listen(env.port, () => {
			console.log(`Server running on port ${env.port}`);
		});
	} catch (error) {
		console.error('Failed to start Server:', error.message);
		process.exitCode = 1;
		await pool.end();
	}
}

startServer();
