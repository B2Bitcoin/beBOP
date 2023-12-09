interface CategorySpecification {
	[key: string]: { attribute: string; value: string }[];
}

export function specificationGroupBy(content: string): CategorySpecification {
	const groupedData: CategorySpecification = {};
	for (const line of content.split('\n')) {
		const [category, attribute, value] = line.split(';').map((entry) => entry.replace(/"/g, ''));

		if (!groupedData[category]) {
			groupedData[category] = [];
		}

		groupedData[category].push({ attribute, value });
	}

	return groupedData;
}
