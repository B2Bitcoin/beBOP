import { ObjectId } from 'mongodb';

export type Pojo<T> = {
	[K in keyof T]: T[K] extends ObjectId
		? string
		: T[K] extends ObjectId | infer Y
		? string | Y
		: T[K];
};

/**
 * Convert an object into a POJO by converting ObjectId to string
 */
export function pojo<T extends object>(param: T): Pojo<T> {
	if (Array.isArray(param)) {
		throw new Error('pojo does not support arrays yet');
	}
	return Object.fromEntries(
		Object.entries(param).map(([key, value]) => {
			if (value instanceof ObjectId) {
				return [key, value.toHexString()];
			}
			return [key, value];
		})
	) as Pojo<T>;
}
