import { ClientSession, ObjectId } from 'mongodb';
import { collections, withTransaction } from './database';
import { marked } from 'marked';
import { env } from '$env/dynamic/private';

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
	},
	{
		_id: new ObjectId('39811201e92e590e858af8ba'),
		name: 'Adding actionSettings to products',
		run: async (session: ClientSession) => {
			await collections.products.updateMany(
				{},
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
	},
	{
		_id: new ObjectId('653cbb1bd2af1254e82c928b'),
		name: 'Change user.backupInfo to user.recovery',
		run: async (session: ClientSession) => {
			await collections.users.dropIndex('backupInfo.npub_1').catch(console.error);
			await collections.users.dropIndex('backupInfo.email_1').catch(console.error);

			await collections.users.updateMany(
				{
					backupInfo: { $exists: true }
				},
				{
					$rename: {
						backupInfo: 'recovery'
					}
				},
				{ session }
			);
		}
	},
	{
		name: 'Add tagIds to products',
		_id: new ObjectId('653cbb1bd2af1254e82c928c'),
		run: async (session: ClientSession) => {
			await collections.products.updateMany(
				{
					tagIds: { $exists: false }
				},
				{
					$set: {
						tagIds: []
					}
				},
				{ session }
			);
		}
	},
	{
		name: 'Add amountsInOtherCurrencies to orders',
		_id: new ObjectId('6567c2700000000000000000'),
		run: async (session: ClientSession) => {
			for await (const order of collections.orders.find(
				{ amountsInOtherCurrencies: { $exists: false } },
				{ session }
			)) {
				order.amountsInOtherCurrencies = {
					main: {
						...('totalReceived' in order.payment &&
							typeof order.payment.totalReceived === 'number' && {
								totalReceived: {
									currency: 'SAT',
									amount: order.payment.totalReceived
								}
							}),
						totalPrice: {
							currency: order.totalPrice.currency,
							amount: order.totalPrice.amount
						},
						...(order.vat && {
							vat: {
								currency: order.vat.price.currency,
								amount: order.vat.price.amount
							}
						})
					},
					priceReference: {
						...('totalReceived' in order.payment &&
							typeof order.payment.totalReceived === 'number' && {
								totalReceived: {
									currency: 'SAT',
									amount: order.payment.totalReceived
								}
							}),
						totalPrice: {
							currency: order.totalPrice.currency,
							amount: order.totalPrice.amount
						},
						...(order.vat && {
							vat: {
								currency: order.vat.price.currency,
								amount: order.vat.price.amount
							}
						})
					}
				};
				for (const item of order.items) {
					item.amountsInOtherCurrencies = {
						main: {
							price: {
								currency: item.product.price.currency,
								amount: item.product.price.amount * item.quantity
							}
						},
						priceReference: {
							price: {
								currency: item.product.price.currency,
								amount: item.product.price.amount * item.quantity
							}
						}
					};
				}

				await collections.orders.updateOne(
					{ _id: order._id },
					{
						$set: {
							amountsInOtherCurrencies: order.amountsInOtherCurrencies,
							items: order.items
						}
					},
					{ session }
				);
			}
		}
	}
];

export async function runMigrations() {
	if (env.VITEST) {
		return;
	}
	const migrationsInDb = await collections.migrations.find().toArray();

	const migrationsToRun = migrations.filter(
		(migration) => !migrationsInDb.find((migrationInDb) => migrationInDb._id.equals(migration._id))
	);

	for (const migration of migrationsToRun) {
		console.log('running migration', migration.name);
		await withTransaction(async (session) => {
			await collections.migrations.insertOne(
				{
					_id: migration._id,
					name: migration.name,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{ session }
			);
			await migration.run(session);
		});
		console.log('done');
	}
}
