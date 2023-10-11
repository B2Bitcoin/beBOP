import { exportDatabase } from '$lib/utils/exportData.js';

export const POST = async () => {
	const exportedDatabase = await exportDatabase();

	return new Response(exportedDatabase, {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': `attachment; filename=backup.json`
		}
	});
};
