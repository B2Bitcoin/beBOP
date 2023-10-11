import { exportDatabase } from '$lib/utils/exportData.js';

export const POST = async ({ request }) => {
	const { exportType } = JSON.parse(await request.text());
	console.log(exportType);

	const exportedDatabase = await exportDatabase(exportType);

	return new Response(exportedDatabase, {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Content-Disposition': `attachment; filename=backup.json`
		}
	});
};
