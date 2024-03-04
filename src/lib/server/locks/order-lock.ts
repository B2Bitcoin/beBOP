import { collections } from '../database';
import { setTimeout } from 'node:timers/promises';
import { processClosed } from '../process';
import { listTransactions, orderAddressLabel } from '../bitcoin';
import { sum } from '$lib/utils/sum';
import { Lock } from '../lock';
import { inspect } from 'node:util';
import { lndLookupInvoice } from '../lightning';
import { toSatoshis } from '$lib/utils/toSatoshis';
import { onOrderPayment, onOrderPaymentFailed } from '../orders';
import { refreshPromise, runtimeConfig } from '../runtime-config';
import { getConfirmationBlocks } from '$lib/server/getConfirmationBlocks';

const lock = new Lock('orders');

async function maintainOrders() {
	await refreshPromise;

	while (!processClosed) {
		if (!lock.ownsLock) {
			await setTimeout(5_000);
			continue;
		}

		const pendingOrders = await collections.orders
			.find({ 'payments.status': 'pending' })
			.toArray()
			.catch((err) => {
				console.error(inspect(err, { depth: 10 }));
				return [];
			});

		for (let order of pendingOrders) {
			for (let payment of order.payments.filter((p) => p.status === 'pending')) {
				// Since we can overwrite order, we need to update payment too if needed
				const updatedPayment = order.payments.find((p) => p._id.equals(payment._id));
				if (!updatedPayment || updatedPayment.status !== 'pending') {
					continue;
				}
				payment = updatedPayment;
				switch (payment.method) {
					case 'bitcoin':
						try {
							const transactions = await listTransactions(
								orderAddressLabel(order._id, payment._id)
							);

							const confirmationBlocks = getConfirmationBlocks(payment.price.amount);

							const received = sum(
								transactions
									.filter((t) => t.amount > 0 && t.confirmations >= confirmationBlocks)
									.map((t) => t.amount)
							);

							const satReceived = toSatoshis(received, 'BTC');

							if (satReceived >= toSatoshis(payment.price.amount, payment.price.currency)) {
								payment.transactions = transactions.map((transaction) => ({
									id: transaction.txid,
									amount: transaction.amount,
									currency: 'BTC' as const
								}));

								order = await onOrderPayment(order, payment, {
									amount: satReceived,
									currency: 'SAT'
								});
							} else if (payment.expiresAt && payment.expiresAt < new Date()) {
								order = await onOrderPaymentFailed(order, payment, 'expired');
							}
						} catch (err) {
							console.error(inspect(err, { depth: 10 }));
						}
						break;
					case 'lightning':
						try {
							if (!payment.invoiceId) {
								throw new Error('Missing invoice ID on lightning order');
							}
							const invoice = await lndLookupInvoice(payment.invoiceId);

							if (invoice.state === 'SETTLED') {
								order = await onOrderPayment(order, payment, {
									amount: invoice.amt_paid_sat,
									currency: 'SAT'
								});
							} else if (invoice.state === 'CANCELED') {
								order = await onOrderPaymentFailed(order, payment, 'expired');
							}
						} catch (err) {
							console.error(inspect(err, { depth: 10 }));
						}
						break;
					case 'card':
						try {
							if (!runtimeConfig.sumUp.apiKey) {
								throw new Error('Missing sumup API key');
							}
							const checkoutId = payment.checkoutId;

							if (!checkoutId) {
								throw new Error('Missing checkout ID on card order');
							}

							const response = await fetch('https://api.sumup.com/v0.1/checkouts/' + checkoutId, {
								headers: {
									Authorization: 'Bearer ' + runtimeConfig.sumUp.apiKey
								},
								...{ autoSelectFamily: true }
							});

							if (!response.ok) {
								throw new Error(
									'Failed to fetch checkout status for order ' +
										order._id +
										', checkout ' +
										checkoutId
								);
							}

							const checkout = await response.json();

							if (checkout.status === 'PAID') {
								payment.transactions = checkout.transactions;
								order = await onOrderPayment(order, payment, {
									amount: checkout.amount,
									currency: checkout.currency
								});
							} else if (checkout.status === 'FAILED' || checkout.status === 'EXPIRED') {
								order = await onOrderPaymentFailed(order, payment, 'expired');
							}
						} catch (err) {
							console.error(inspect(err, { depth: 10 }));
						}
						break;
					// handled by admin
					case 'bank-transfer':
					case 'point-of-sale':
						break;
				}
			}
		}

		await setTimeout(2_000);
	}
}

maintainOrders();
