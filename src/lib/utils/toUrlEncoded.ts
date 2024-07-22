/**
 * Convert {a: {b: 1}, c: [0]} to [['a[b]', 1], ['c[0]', 0]]
 */
function flatEntries(
	obj: Partial<Record<string, unknown>>,
	prefix = '',
	depth = 0
): Array<[string, unknown]> {
	if (depth > 10) {
		throw new Error('Depth limit reached');
	}
	const ret: Array<[string, unknown]> = [];

	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === 'object' && value !== null) {
			ret.push(...flatEntries(value as Record<string, unknown>, `${prefix}[${key}]`, depth + 1));
		} else {
			ret.push([`${prefix}[${key}]`, value]);
		}
	}

	return ret;
}

/**
 * Convert JS object to url-encoded string, using stripe's format
 */
export function toUrlEncoded(obj: Record<string, unknown>): string {
	return flatEntries(obj)
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
		.join('&');
}
