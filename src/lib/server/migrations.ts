import { ClientSession, ObjectId } from 'mongodb';
import { collections, withTransaction } from './database';
import { marked } from 'marked';
import { env } from '$env/dynamic/private';
import type { OrderPayment } from '$lib/types/Order';
import { Lock } from './lock';

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
				// @ts-expect-error migration stuff
				order.amountsInOtherCurrencies = {
					main: {
						// @ts-expect-error migration stuff
						...('totalReceived' in order.payment &&
							// @ts-expect-error migration stuff
							typeof order.payment.totalReceived === 'number' && {
								totalReceived: {
									currency: 'SAT',
									// @ts-expect-error migration stuff
									amount: order.payment.totalReceived
								}
							}),
						totalPrice: {
							// @ts-expect-error migration stuff
							currency: order.totalPrice.currency,
							// @ts-expect-error migration stuff
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
						// @ts-expect-error migration stuff
						...('totalReceived' in order.payment &&
							// @ts-expect-error migration stuff
							typeof order.payment.totalReceived === 'number' && {
								totalReceived: {
									currency: 'SAT',
									// @ts-expect-error migration stuff
									amount: order.payment.totalReceived
								}
							}),
						totalPrice: {
							// @ts-expect-error migration stuff
							currency: order.totalPrice.currency,
							// @ts-expect-error migration stuff
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
					// @ts-expect-error migration stuff
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
							// @ts-expect-error migration stuff
							amountsInOtherCurrencies: order.amountsInOtherCurrencies,
							items: order.items
						}
					},
					{ session }
				);
			}
		}
	},
	{
		name: 'Convert to multiple payments',
		_id: new ObjectId('65713a19c783f535de973957'),
		run: async (session: ClientSession) => {
			for await (const order of collections.orders.find(
				{ payments: { $exists: false }, payment: { $exists: true } },
				{ session }
			)) {
				for (const item of order.items) {
					// @ts-expect-error migration stuff
					item.currencySnapshot = item.amountsInOtherCurrencies ?? item.currencySnapshot;
				}
				// @ts-expect-error migration stuff
				order.currencySnapshot = order.amountsInOtherCurrencies ?? order.currencySnapshot;
				// @ts-expect-error migration stuff
				const legacyPayment: OrderPayment = order.payment;
				const payment: OrderPayment = {
					...legacyPayment,
					_id: new ObjectId(),
					// @ts-expect-error migration stuff
					price: order.totalPrice,
					currencySnapshot: {
						// @ts-expect-error migration stuff
						main: order.currencySnapshot.main.totalPrice,
						// @ts-expect-error migration stuff
						priceReference: order.currencySnapshot.priceReference.totalPrice,
						// @ts-expect-error migration stuff
						secondary: order.currencySnapshot.secondary?.totalPrice
					},
					// @ts-expect-error migration stuff
					lastStatusNotified: order.lastPaymentStatusNotified,
					// @ts-expect-error migration stuff
					invoice: order.invoice
				};
				await collections.orders.updateOne(
					{ _id: order._id },
					{
						$set: {
							payments: [payment],
							items: order.items,
							status: payment.status,
							currencySnapshot: order.currencySnapshot
						},
						$unset: {
							payment: '',
							amountsInOtherCurrencies: '',
							lastPaymentStatusNotified: '',
							invoice: ''
						}
					},
					{ session }
				);
			}
		}
	},
	{
		name: 'Update payments currencySnapshot',
		_id: new ObjectId('6577739b4feec6c5137a2202'),
		run: async (session: ClientSession) => {
			for await (const order of collections.orders.find(
				{ payments: { $exists: true } },
				{ session }
			)) {
				for (const payment of order.payments) {
					if (!payment.currencySnapshot) {
						continue;
					}
					if ('amount' in payment.currencySnapshot.main) {
						payment.currencySnapshot = {
							main: {
								// @ts-expect-error migration stuff
								price: payment.currencySnapshot.main
							},
							priceReference: {
								// @ts-expect-error migration stuff
								price: payment.currencySnapshot.priceReference
							},
							...(payment.currencySnapshot.secondary && {
								secondary: {
									price: payment.currencySnapshot.secondary
								}
							})
						};
					}
				}
				await collections.orders.updateOne(
					{ _id: order._id },
					{
						$set: {
							payments: order.payments
						}
					},
					{ session }
				);
			}
		}
	},
	{
		name: 'Change bankTransfer to bank-transfer',
		_id: new ObjectId('657f7c76602c2bc0ef4acef4'),
		run: async (session: ClientSession) => {
			let count = 10;
			while (count--) {
				const result = await collections.orders.updateMany(
					{
						'payments.method': 'bankTransfer'
					},
					{
						$set: {
							'payments.$.method': 'bank-transfer'
						}
					},
					{ session }
				);

				if (result.modifiedCount === 0) {
					break;
				}
			}
		}
	}
];

export async function runMigrations() {
	if (env.VITEST) {
		return;
	}
	const lock = await Lock.tryAcquire('migrations');
	if (!lock) {
		return;
	}

	try {
		const migrationsInDb = await collections.migrations.find().toArray();

		const migrationsToRun = migrations.filter(
			(migration) =>
				!migrationsInDb.find((migrationInDb) => migrationInDb._id.equals(migration._id))
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
	} finally {
		lock.destroy();
	}
}
