export function typedValues<T>(obj: Record<string, T>): T[] {
	return Object.values(obj) as T[];
}
