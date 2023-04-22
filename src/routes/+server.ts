export const GET = async () => {
	const { runtimeConfig } = await import('$lib/server/runtime-config');
	return {
		body: {
			x: runtimeConfig.BTC_EUR
		}
	};
};
