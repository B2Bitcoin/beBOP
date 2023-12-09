import { trimPrefix } from './trimPrefix';
import { trimSuffix } from './trimSuffix';

interface CategorySpecification {
	[key: string]: { attribute: string; value: string }[];
}

export function specificationGroupBy(content: string): CategorySpecification {
	const groupedSpecification: CategorySpecification = {};
	for (const line of content.split('\n')) {
		const [category, attribute, value] = line
			.split(';')
			.map((entry) => trimPrefix(trimSuffix(entry, '"'), '"'));

		if (!groupedSpecification[category]) {
			groupedSpecification[category] = [];
		}

		groupedSpecification[category].push({ attribute, value });
	}

	return groupedSpecification;
}
