import { ObjectId } from 'mongodb';
import type { IsUnknown, UnknownArray } from 'type-fest';

export type PojoList<T extends UnknownArray> = T extends readonly []
	? []
	: T extends readonly [infer F, ...infer R]
	? [Pojo<F>, ...PojoList<R>]
	: IsUnknown<T[number]> extends true
	? []
	: Array<Pojo<T[number]>>;

export type PojoObject<T extends object> = {
	[K in keyof T]: ObjectId extends T[K] ? Pojo<Exclude<T[K], ObjectId>> | string : Pojo<T[K]>;
};

export type Pojo<T> = ObjectId extends T
	? Exclude<Pojo<T>, ObjectId> | string
	: T extends UnknownArray
	? PojoList<T>
	: T extends object
	? PojoObject<T>
	: T;

/**
 * Convert an object into a POJO by converting ObjectId to string
 */
export function pojo<T>(param: T): Pojo<T> {
	if (param === null || typeof param !== 'object') {
		return param as Pojo<T>;
	}
	if (param instanceof ObjectId) {
		return param.toHexString() as Pojo<T>;
	}
	if (Array.isArray(param)) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return param.map((x) => (pojo as any)(x)) as Pojo<T>;
	}
	if (Object.getPrototypeOf(param) !== Object.prototype) {
		return param as Pojo<T>;
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
