export function typedFromEntries<K extends string, V>(
	obj: Readonly<Array<Readonly<[K, V]>>>
): Partial<Record<K, V>> {
	return Object.fromEntries(obj) as Partial<Record<K, V>>;
}
