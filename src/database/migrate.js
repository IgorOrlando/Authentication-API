import { readdir, readFile } from 'node:fs/promises';
import { URL, fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const migrationsDirectory = fileURLToPath(new URL('./migrations/', import.meta.url));

async function runMigrations() {
	const client = await pool.connect();

	try {
		await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

		const result = await client.query('SELECT id FROM schema_migrations');
		const appliedMigrations = new Set(result.rows.map((row) => row.id));

		const files = (await readdir(migrationsDirectory))
			.filter((file) => file.endsWith('.sql'))
			.sort();

		for (const file of files) {
			if (appliedMigrations.has(file)) {
				console.log(`Skipping ${file} (already applied)`);
				continue;
			}

			const sql = await readFile(new URL(`./migrations/${file}`, import.meta.url), 'utf8');

			await client.query('BEGIN');

			try {
				await client.query(sql);
				await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
				await client.query('COMMIT');

				console.log(`Applied ${file}`);
			} catch (error) {
				await client.query('ROLLBACK');
				throw error;
			}
		}

		console.log('Migrations completed');
	} finally {
		client.release();
	}
}

try {
	await runMigrations();
} catch (error) {
	console.error('Migration failed:', error.message);
	process.exitCode = 1;
} finally {
	await pool.end();
}
