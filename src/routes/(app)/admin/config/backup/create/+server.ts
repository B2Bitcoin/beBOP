import { exportDatabase } from '$lib/utils/exportData.js';
import { json } from '@sveltejs/kit';

export const POST = async () => {
	const exportedDatabase = await exportDatabase();

	return json(exportedDatabase, { status: 200 });
};
