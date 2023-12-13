import type { Picture } from '$lib/types/Picture';
import { collections } from '$lib/server/database';
import { picturesForProducts } from '$lib/server/picture';
import { runtimeConfig } from '$lib/server/runtime-config';
import type { Cart } from '$lib/types/Cart';
import type { Currency } from '$lib/types/Currency';
import type { DigitalFile } from '$lib/types/DigitalFile';
import type { Order } from '$lib/types/Order';
import type { Product } from '$lib/types/Product';
import { filterUndef } from '$lib/utils/filterUndef';
import { groupBy } from 'lodash-es';
import { differenceInSeconds } from 'date-fns';
import type { WithId } from 'mongodb';

type FormattedCartItem = {
	product: Pick<
		Product,
		| 'stock'
		| '_id'
		| 'name'
		| 'maxQuantityPerOrder'
		| 'deliveryFees'
		| 'price'
		| 'shortDescription'
		| 'type'
		| 'availableDate'
		| 'shipping'
		| 'preorder'
		| 'applyDeliveryFeesOnlyOnce'
		| 'requireSpecificDeliveryFee'
		| 'payWhatYouWant'
		| 'standalone'
	>;
	picture: Picture | null;
	digitalFiles: WithId<DigitalFile>[];
	quantity: number;
	customPrice?: {
		amount: number;
		currency: Currency;
	};
};

export async function formatCart(
	cart: WithId<Cart> | null,
	locals: Pick<App.Locals, 'language'>
): Promise<FormattedCartItem[]> {
	if (cart?.items.length) {
		const products = await collections.products
			.find<
				Pick<
					Product,
					| '_id'
					| 'name'
					| 'price'
					| 'shortDescription'
					| 'type'
					| 'availableDate'
					| 'shipping'
					| 'preorder'
					| 'deliveryFees'
					| 'applyDeliveryFeesOnlyOnce'
					| 'requireSpecificDeliveryFee'
					| 'payWhatYouWant'
					| 'standalone'
					| 'maxQuantityPerOrder'
					| 'stock'
				>
			>(
				{ _id: { $in: cart.items.map((item) => item.productId) } },
				{
					projection: {
						_id: 1,
						name: { $ifNull: [`$translations.${locals.language}.name`, '$name'] },
						price: 1,
						shortDescription: {
							$ifNull: [`$translations.${locals.language}.shortDescription`, '$shortDescription']
						},
						type: 1,
						shipping: 1,
						availableDate: 1,
						preorder: 1,
						deliveryFees: 1,
						applyDeliveryFeesOnlyOnce: 1,
						requireSpecificDeliveryFee: 1,
						payWhatYouWant: 1,
						standalone: 1,
						maxQuantityPerOrder: 1,
						stock: 1
					}
				}
			)
			.toArray();

		const productById = Object.fromEntries(products.map((product) => [product._id, product]));
		const pictures = await picturesForProducts(products.map((product) => product._id));
		const pictureByProductId = Object.fromEntries(
			pictures.map((picture) => [picture.productId, picture])
		);
		const digitalFiles = await collections.digitalFiles
			.find({ productId: { $in: products.map((product) => product._id) } })
			.toArray();
		const digitalFilesByProductId = groupBy(digitalFiles, 'productId');

		return await Promise.all(
			cart.items
				.filter((item) => productById[item.productId])
				.map(async (item) => {
					const productDoc = productById[item.productId];
					if (runtimeConfig.deliveryFees.mode !== 'perItem') {
						delete productDoc.deliveryFees;
					}
					return {
						product: productDoc,
						picture: pictureByProductId[item.productId] || null,
						digitalFiles: digitalFilesByProductId[item.productId] || [],
						quantity: item.quantity,
						...(item.customPrice && { customPrice: item.customPrice })
					};
				})
		).then((res) => filterUndef(res));
	}

	return [];
}

export function formatOrder(order: Order) {
	if (order.status !== 'pending' && differenceInSeconds(new Date(), order.updatedAt) > 5) {
		return null;
	}
	return {
		_id: order._id,
		number: order.number,
		payments: order.payments.map((payment) => ({
			id: payment._id.toString(),
			price: payment.price,
			status: payment.status,
			method: payment.method
		})),
		status: order.status,
		vat: order.vat,
		totalPrice: order.currencySnapshot.main.totalPrice
	};
}
