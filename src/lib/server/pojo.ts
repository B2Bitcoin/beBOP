import { ObjectId } from 'mongodb';

export type Pojo<T> = {
	[K in keyof T]: T[K] extends ObjectId
		? string
		: T[K] extends ObjectId | undefined
		? string | undefined
		: T[K];
};

/**
 * Convert an object into a POJO by converting ObjectId to string
 */
export function pojo<T extends Record<string, unknown>>(param: T): Pojo<T> {
	return Object.fromEntries(
		Object.entries(param).map(([key, value]) => {
			if (value instanceof ObjectId) {
				return [key, value.toHexString()];
			}
			return [key, value];
		})
	) as Pojo<T>;
}
