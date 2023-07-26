export function typedKeys<K extends string, V>(obj: { [k in K]: V }): K[] {
	return Object.keys(obj) as K[];
}
