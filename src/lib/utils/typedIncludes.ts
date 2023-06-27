export function typedInclude<V, const T extends V>(arr: readonly T[], v: V): v is T {
	return arr.includes(v as T);
}
