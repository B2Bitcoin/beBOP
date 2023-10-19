import { ObjectId } from 'mongodb';

export function convertObjectIdsToStrings(obj: any) {
	if (!obj) {
		return obj;
	}

	for (const key in obj) {
		if (obj[key] instanceof ObjectId) {
			obj[key] = obj[key].toString();
		} else if (typeof obj[key] === 'object') {
			convertObjectIdsToStrings(obj[key]);
		}
	}
	return obj;
}
