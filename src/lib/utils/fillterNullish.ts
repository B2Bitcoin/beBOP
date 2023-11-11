export function filterNullish<T>(arr: (T | undefined | null)[]): T[] {
	return arr.filter((x): x is T => x !== undefined && x !== null);
}
