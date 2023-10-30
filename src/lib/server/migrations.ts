import { ClientSession, ObjectId } from 'mongodb';
import { collections, withTransaction } from './database';
import { marked } from 'marked';

const migrations = [
	{
		_id: new ObjectId('65281201e92e590e858af6cb'),
		name: 'Migrate CMS page content from Markdown to HTML',
		run: async (session: ClientSession) => {
			for await (const page of await collections.cmsPages.find()) {
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
	},
	{
		_id: new ObjectId('39811201e92e590e858af8ba'),
		name: 'Adding actionSettings to products',
		run: async (session: ClientSession) => {
			for await (const product of await collections.products.find()) {
				await collections.products.updateOne(
					{
						_id: product._id
					},
					{
						$set: {
							actionSettings: {
								eShop: {
									visible: true,
									canBeAddedToBasket: true
								},
								retail: {
									visible: true,
									canBeAddedToBasket: true
								},
								googleShopping: {
									visible: true
								}
							}
						}
					},
					{ session }
				);
			}
		}
	}
];

export async function runMigrations() {
	const migrationsCollection = await collections.migrations;
	const migrationsInDb = await migrationsCollection.find().toArray();

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
