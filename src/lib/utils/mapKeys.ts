/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapKeys<T extends Record<string, any>, U extends Record<string, any>>(
	obj: T,
	fn: (key: keyof T) => keyof U
): Record<keyof U, T[keyof T]> {
	const result = {} as T[keyof T];
	for (const key in obj) {
		result[fn(key)] = obj[key] as any;
	}
	return result;
}
