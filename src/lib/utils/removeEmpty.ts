export function removeEmpty<T>(obj: T): T {
	const newObj = {} as T;
	for (const key in obj) {
		if (obj[key] !== null && obj[key] !== undefined) {
			newObj[key] = obj[key];
		}
	}
	return newObj;
}
