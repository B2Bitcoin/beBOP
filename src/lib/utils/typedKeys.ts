export function typedKeys<K extends string>(obj: { [k in K]?: unknown }): K[] {
	return Object.keys(obj) as K[];
}
