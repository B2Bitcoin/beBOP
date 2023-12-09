interface CategorySpecification {
	[key: string]: { attribute: string; value: string }[];
}

export function specificationGroupBy(content: string): CategorySpecification {
	const groupedData: CategorySpecification = content
		.split('\n')
		.reduce((result: CategorySpecification, line) => {
			const [category, attribute, value] = line.split(';').map((entry) => entry.replace(/"/g, ''));

			if (!result[category]) {
				result[category] = [];
			}

			result[category].push({ attribute, value });

			return result;
		}, {});

	return groupedData;
}
