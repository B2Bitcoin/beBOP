import { describe, beforeEach, it, expect, assert } from 'vitest';
import { collections } from './database';
import { cleanDb } from './test-utils';
import { addToCartInDb } from './cart';
import { createOrder } from './orders';
import { HttpError_1 } from '@sveltejs/kit';
import {
	TEST_DIGITAL_PRODUCT,
	TEST_PRODUCT_STOCK,
	TEST_DIGITAL_PRODUCT_UNLIMITED,
	TEST_PHYSICAL_PRODUCT
} from './seed/product';
import { computePriceInfo } from '$lib/types/Cart';
import { toCurrency } from '$lib/utils/toCurrency';

describe('cart', () => {
	beforeEach(async () => {
		await cleanDb();
		await collections.products.insertMany([TEST_DIGITAL_PRODUCT, TEST_DIGITAL_PRODUCT_UNLIMITED]);
	});

	it('should add a product to the cart', async () => {
		await addToCartInDb(TEST_DIGITAL_PRODUCT, 1, {
			user: {
				sessionId: 'test-session-id'
			}
		});

		expect(await collections.carts.countDocuments({ 'user.sessionId': 'test-session-id' })).toBe(1);
	});

	it('should fail to add a product to the cart when no stock', async () => {
		await expect(
			addToCartInDb(TEST_DIGITAL_PRODUCT, 10, {
				user: {
					sessionId: 'test-session-id'
				}
			})
		).rejects.toThrow(HttpError_1);
	});

	it('should prevent adding a product when reserved by another user', async () => {
		await addToCartInDb(TEST_DIGITAL_PRODUCT, TEST_PRODUCT_STOCK, {
			user: {
				sessionId: 'test-session-id'
			}
		});
		await expect(
			addToCartInDb(TEST_DIGITAL_PRODUCT, TEST_PRODUCT_STOCK, {
				user: {
					sessionId: 'test-session-id2'
				}
			})
		).rejects.toThrow(HttpError_1);
	});

	it('should allow checking out a product when the reservation is expired', async () => {
		await addToCartInDb(TEST_DIGITAL_PRODUCT, TEST_PRODUCT_STOCK, {
			user: {
				sessionId: 'test-session-id'
			}
		});
		const cart = await collections.carts.findOne({ 'user.sessionId': 'test-session-id' });
		assert(cart, 'Cart should exist');
		cart.items[0].reservedUntil = new Date(0);
		await collections.carts.updateOne({ _id: cart._id }, { $set: { items: cart.items } });
		await addToCartInDb(TEST_DIGITAL_PRODUCT, TEST_PRODUCT_STOCK, {
			user: {
				sessionId: 'test-session-id2'
			}
		});
		// Refresh first cart
		await addToCartInDb(TEST_DIGITAL_PRODUCT_UNLIMITED, 1, {
			user: {
				sessionId: 'test-session-id'
			}
		});
		const cart2 = await collections.carts.findOne({ 'user.sessionId': 'test-session-id2' });
		assert(cart2, 'Cart 2 should exist');
		// Second user should be able to check out
		await expect(
			createOrder(
				[
					{
						quantity: TEST_PRODUCT_STOCK,
						product: TEST_DIGITAL_PRODUCT
					}
				],
				'point-of-sale',
				{
					locale: 'en',
					cart: cart2,
					user: {
						sessionId: 'test-session-id2'
					},
					userVatCountry: 'FR',
					shippingAddress: null
				}
			)
		).resolves.toBeDefined();
	});

	describe('computePriceInfo', () => {
		describe('when vatExempted is true', () => {
			it('should return the price without VAT', () => {
				const priceInfo = computePriceInfo([{ product: TEST_DIGITAL_PRODUCT, quantity: 1 }], {
					vatExempted: true,
					bebopCountry: 'FR',
					userCountry: 'CH',
					deliveryFees: {
						amount: 0,
						currency: 'EUR'
					},
					vatNullOutsideSellerCountry: false,
					vatSingleCountry: false
				});
				expect(priceInfo.totalPriceWithVat).toBe(
					toCurrency(
						priceInfo.currency,
						TEST_DIGITAL_PRODUCT.price.amount,
						TEST_DIGITAL_PRODUCT.price.currency
					)
				);
				expect(priceInfo.totalPrice).toBe(priceInfo.totalPriceWithVat);
				expect(priceInfo.totalVat).toBe(0);
				expect(priceInfo.partialDigitalVat).toBe(0);
				expect(priceInfo.partialPhysicalVat).toBe(0);
				expect(priceInfo.vat.length).toBe(0);
			});
		});

		describe('when vatNullOutsideSellerCountry is true', () => {
			describe("when the user's country is the same as the seller's country", () => {
				it('should return the price with VAT for physical products', () => {
					const priceInfo = computePriceInfo([{ product: TEST_PHYSICAL_PRODUCT, quantity: 1 }], {
						vatExempted: false,
						bebopCountry: 'FR',
						userCountry: 'FR',
						deliveryFees: {
							amount: 0,
							currency: 'EUR'
						},
						vatNullOutsideSellerCountry: true,
						vatSingleCountry: false
					});
					expect(priceInfo.totalPriceWithVat).toBeGreaterThan(priceInfo.totalPrice);
					expect(priceInfo.totalVat).toBeGreaterThan(0);
					expect(priceInfo.partialDigitalVat).toBe(0);
					expect(priceInfo.partialPhysicalVat).toBeGreaterThan(0);
					expect(priceInfo.vat.length).toBe(1);
					expect(priceInfo.vat[0].price.amount).toBe(priceInfo.totalVat);
					expect(priceInfo.vat[0].price.amount).toBe(priceInfo.partialPhysicalVat);
				});
			});

			describe("when the user's country is different from the seller's country", () => {
				it('should return the price with VAT for digital products', () => {
					const priceInfo = computePriceInfo([{ product: TEST_DIGITAL_PRODUCT, quantity: 1 }], {
						vatExempted: false,
						bebopCountry: 'FR',
						userCountry: 'CH',
						deliveryFees: {
							amount: 0,
							currency: 'EUR'
						},
						vatNullOutsideSellerCountry: true,
						vatSingleCountry: false
					});

					expect(priceInfo.totalPriceWithVat).toBeGreaterThan(priceInfo.totalPrice);
					expect(priceInfo.totalVat).toBeGreaterThan(0);
					expect(priceInfo.partialDigitalVat).toBeGreaterThan(0);
					expect(priceInfo.partialPhysicalVat).toBe(0);
					expect(priceInfo.vat.length).toBe(1);
				});

				it('should return the price without VAT for physical products', () => {
					const priceInfo = computePriceInfo([{ product: TEST_PHYSICAL_PRODUCT, quantity: 1 }], {
						vatExempted: false,
						bebopCountry: 'FR',
						userCountry: 'CH',
						deliveryFees: {
							amount: 0,
							currency: 'EUR'
						},
						vatNullOutsideSellerCountry: true,
						vatSingleCountry: false
					});
					expect(priceInfo.totalPriceWithVat).toBe(
						toCurrency(
							priceInfo.currency,
							TEST_PHYSICAL_PRODUCT.price.amount,
							TEST_PHYSICAL_PRODUCT.price.currency
						)
					);
					expect(priceInfo.totalPrice).toBe(priceInfo.totalPriceWithVat);
					expect(priceInfo.totalVat).toBe(0);
					expect(priceInfo.partialDigitalVat).toBe(0);
					expect(priceInfo.partialPhysicalVat).toBe(0);
					expect(priceInfo.vat.length).toBe(0);
				});
			});
		});
	});
});
