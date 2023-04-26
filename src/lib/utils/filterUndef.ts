export function filterUndef<T>(arr: (T | undefined)[]): T[] {
	return arr.filter((x): x is T => x !== undefined);
}
