import { ClientSession, ObjectId } from 'mongodb';
import { collections, withTransaction } from './database';
import { marked } from 'marked';

const migrations = [
	{
		_id: new ObjectId('65281201e92e590e858af6cb'),
		name: 'Migrate CMS page content from Markdown to HTML',
		run: async (session: ClientSession) => {
			for await (const page of collections.cmsPages.find()) {
				await collections.cmsPages.updateOne(
					{
						_id: page._id
					},
					{
						$set: {
							content: marked(page.content)
						}
					},
					{ session }
				);
			}
		}
	}
];

export async function runMigrations() {
	const migrationsInDb = await collections.migrations.find().toArray();

	const migrationsToRun = migrations.filter(
		(migration) => !migrationsInDb.find((migrationInDb) => migrationInDb._id.equals(migration._id))
	);

	for (const migration of migrationsToRun) {
		await withTransaction(async (session) => {
			await collections.migrations.insertOne({
				_id: migration._id,
				name: migration.name,
				createdAt: new Date(),
				updatedAt: new Date()
			});
			await migration.run(session);
		});
	}
}
