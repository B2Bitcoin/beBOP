interface CategorySpecification {
	[key: string]: { attribute: string; value: string }[];
}

export function specificationGroupBy(content: string): CategorySpecification {
	const groupedSpecification: CategorySpecification = {};
	for (const line of content.split('\n')) {
		const [category, attribute, value] = line.split(';').map((entry) => entry.replace(/"/g, ''));

		if (!groupedSpecification[category]) {
			groupedSpecification[category] = [];
		}

		groupedSpecification[category].push({ attribute, value });
	}

	return groupedSpecification;
}
