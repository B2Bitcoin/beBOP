import { exportDatabase } from '$lib/utils/exportData.js';

export const actions = {
	default: async function () {
		const exportedDatabse = await exportDatabase();

		console.log(exportedDatabse);

		return {
			success: true
		};
	}
};
