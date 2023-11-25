import { runtimeConfig } from '$lib/server/runtime-config';

export const GET = async () => {
	return new Response(JSON.stringify(runtimeConfig.exchangeRate), {
		status: 200,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
