/**
 * Similar to lodash's uniqBy. In case of multiple items with the same key,
 * only the first one is kept.
 */
export function uniqBy<T, K>(items: T[], itemToKey: (item: T) => K): T[] {
	const keys = new Set(items.map((item) => itemToKey(item)));

	return items.filter((item) => {
		// Will return true if was in set - e.g. was the first item with its key.
		return keys.delete(itemToKey(item));
	});
}
