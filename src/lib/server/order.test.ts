import { beforeEach, describe, expect, it } from 'vitest';
import { cleanDb } from './test-utils';
import { collections } from './database';
import { TEST_PRODUCT, TEST_PRODUCT_UNLIMITED } from './seed/product';
import { createOrder, onOrderPayment } from './orders';

describe('order', () => {
	beforeEach(async () => {
		await cleanDb();
		await collections.products.insertMany([TEST_PRODUCT, TEST_PRODUCT_UNLIMITED]);
	});

	describe('onOrderPaid', () => {
		it('should save currency snapshot', async () => {
			const orderId = await createOrder(
				[
					{
						product: TEST_PRODUCT,
						quantity: 1
					}
				],
				'cash',
				{
					user: {
						sessionId: 'test-session-id'
					},
					shippingAddress: null,
					vatCountry: 'FR'
				}
			);

			let order = await collections.orders.findOne({ _id: orderId });

			if (!order) {
				throw new Error('Order not found');
			}

			const totalPrice = order.totalPrice;

			await onOrderPayment(order, order.payments[0], totalPrice);

			order = await collections.orders.findOne({ _id: orderId });

			expect(order?.currencySnapshot).toBeDefined();
			expect(order?.currencySnapshot?.main.totalReceived).toBeDefined();
			expect(order?.currencySnapshot?.priceReference.totalReceived).toBeDefined();
			expect(order?.currencySnapshot?.secondary?.totalReceived).toBeDefined();
		});

		it('should increase the invoice number each time', async () => {
			const order1Id = await createOrder(
				[
					{
						product: TEST_PRODUCT,
						quantity: 1
					}
				],
				'cash',
				{
					user: {
						sessionId: 'test-session-id'
					},
					shippingAddress: null,
					vatCountry: 'FR'
				}
			);

			const order2Id = await createOrder(
				[
					{
						product: TEST_PRODUCT,
						quantity: 1
					}
				],
				'cash',
				{
					user: {
						sessionId: 'test-session-id'
					},
					shippingAddress: null,
					vatCountry: 'FR'
				}
			);

			let order1 = await collections.orders.findOne({ _id: order1Id });
			if (!order1) {
				throw new Error('Order 1 not found');
			}

			let order2 = await collections.orders.findOne({ _id: order2Id });
			if (!order2) {
				throw new Error('Order 2 not found');
			}

			expect(order1.payments[0].invoice?.number).toBeUndefined();
			expect(order2.payments[0].invoice?.number).toBeUndefined();

			await onOrderPayment(order2, order2.payments[0], order2.totalPrice);
			await onOrderPayment(order1, order1.payments[0], order1.totalPrice);

			order1 = await collections.orders.findOne({ _id: order1Id });
			expect(order1?.payments[0].invoice?.number).toBe(2);
			order2 = await collections.orders.findOne({ _id: order2Id });
			expect(order2?.payments[0].invoice?.number).toBe(1);

			const order3Id = await createOrder(
				[
					{
						product: TEST_PRODUCT,
						quantity: 1
					}
				],
				'cash',
				{
					user: {
						sessionId: 'test-session-id'
					},
					shippingAddress: null,
					vatCountry: 'FR'
				}
			);

			let order3 = await collections.orders.findOne({ _id: order3Id });

			if (!order3) {
				throw new Error('Order 3 not found');
			}

			await onOrderPayment(order3, order3.payments[0], order3.totalPrice);

			order3 = await collections.orders.findOne({ _id: order3Id });

			expect(order3?.payments[0].invoice?.number).toBe(3);
		});
	});
});
